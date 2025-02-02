import { NextApiRequest, NextApiResponse } from 'next';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { OnixAnalysis, IOnixNode } from '@/app/models/OnixAnalysis';

const parseXmlAsync = promisify(parseString);

interface NodeCount {
  [key: string]: number;
}

function determineOnixFormat(xmlData: string): 'short' | 'reference' {
  return xmlData.includes('<ONIXMessage') ? 'reference' : 'short';
}

function countNodes(obj: any, parentPath = '', counts: NodeCount = {}): NodeCount {
  if (typeof obj !== 'object' || obj === null) return counts;

  Object.keys(obj).forEach(key => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    counts[currentPath] = (counts[currentPath] || 0) + 1;

    if (Array.isArray(obj[key])) {
      obj[key].forEach((item: any) => {
        countNodes(item, currentPath, counts);
      });
    } else if (typeof obj[key] === 'object') {
      countNodes(obj[key], currentPath, counts);
    }
  });

  return counts;
}

function buildTreeStructure(counts: NodeCount): IOnixNode[] {
  const root: { [key: string]: IOnixNode } = {};

  Object.entries(counts).forEach(([path, count]) => {
    const parts = path.split('.');
    let current = root;

    parts.forEach((part, index) => {
      const currentPath = parts.slice(0, index + 1).join('.');
      if (!current[currentPath]) {
        current[currentPath] = {
          path: part,
          count,
          children: {},
        };
      }
      current = current[currentPath].children as any;
    });
  });

  function convertToArray(node: any): IOnixNode[] {
    return Object.values(node).map(n => ({
      path: n.path,
      count: n.count,
      children: n.children && Object.keys(n.children).length > 0
        ? convertToArray(n.children)
        : undefined,
    }));
  }

  return convertToArray(root);
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const xmlData = await file.text();
    const format = determineOnixFormat(xmlData);
    const parsedData = await parseXmlAsync(xmlData);
    const nodeCounts = countNodes(parsedData);
    const treeStructure = buildTreeStructure(nodeCounts);

    const totalRecords = format === 'reference' 
      ? (parsedData.ONIXMessage?.Product || []).length
      : (parsedData.ONIXmessage?.product || []).length;

    const analysis = await OnixAnalysis.create({
      fileName: file.name,
      format,
      nodeMap: treeStructure,
      totalRecords,
    });

    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error processing ONIX file:', error);
    return res.status(500).json({ error: 'Failed to process ONIX file' });
  }
} 