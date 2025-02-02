import { parseString } from 'xml2js';
import { promisify } from 'util';

export const parseXmlAsync = promisify(parseString);

export function cleanXmlNode(node: any): any {
  if (Array.isArray(node)) {
    return node.map(cleanXmlNode);
  }
  
  if (typeof node === 'object' && node !== null) {
    const cleanedObj: any = {};
    Object.entries(node).forEach(([key, value]) => {
      // Remove XML attributes and clean up arrays with single items
      if (key !== '$') {
        const cleanedValue = cleanXmlNode(value);
        cleanedObj[key] = Array.isArray(cleanedValue) && cleanedValue.length === 1
          ? cleanedValue[0]
          : cleanedValue;
      }
    });
    return cleanedObj;
  }
  
  return node;
}

export function isOnixReferenceFormat(xmlData: string): boolean {
  const lowercaseXml = xmlData.toLowerCase();
  return lowercaseXml.includes('<onixmessage') || 
         lowercaseXml.includes('xmlns="http://ns.editeur.org/onix/3.0/reference"');
}

export function getProductsFromOnix(parsedData: any): any[] {
  // Handle both uppercase and lowercase variations
  const message = parsedData.ONIXMessage || parsedData.ONIXmessage || parsedData.Onixmessage || parsedData.onixmessage;
  const products = message?.Product || message?.product || [];
  return Array.isArray(products) ? products : [products];
} 