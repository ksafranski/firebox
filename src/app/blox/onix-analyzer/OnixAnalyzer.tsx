"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Button, Tree, Space, message, Spin, Tooltip } from 'antd';
import { 
  UploadOutlined, 
  SearchOutlined, 
  ExportOutlined, 
  FileTextOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  DownOutlined,
  UpOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { Container } from '@/app/components/Container';
import type { IOnixNode } from '@/app/models/OnixAnalysis';
import type { UploadProps } from 'antd';

const { DirectoryTree } = Tree;

export const OnixAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [treeData, setTreeData] = useState<IOnixNode[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [treeHeight, setTreeHeight] = useState(600);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [transformedTreeData, setTransformedTreeData] = useState<any[]>([]);

  // Calculate tree height based on window size
  useEffect(() => {
    const calculateHeight = () => {
      // Subtract header height (64px), padding (48px), title and buttons height (~100px)
      const height = window.innerHeight - 64 - 48 - 100;
      setTreeHeight(Math.max(400, height)); // Minimum height of 400px
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Transform tree data when it changes
  useEffect(() => {
    if (treeData.length > 0) {
      const { transformed, allKeys } = transformTreeData(treeData);
      setTransformedTreeData(transformed);
      setExpandedKeys(allKeys);
    } else {
      setTransformedTreeData([]);
      setExpandedKeys([]);
    }
  }, [treeData]);

  const handleFileUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      setFile(info.file.originFileObj);
      messageApi.success(`${info.file.name} ready for analysis`);
    } else if (info.file.status === 'error') {
      messageApi.error(`${info.file.name} upload failed.`);
    }
  };

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    try {
      onSuccess();
    } catch (error) {
      onError(error);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      messageApi.error('Please upload an ONIX file first');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/onix-analyzer/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      console.log('API Response:', JSON.stringify(data.nodeMap, null, 2));
      
      // Log all nodes with unique values
      const nodesWithValues = data.nodeMap.filter((node: any) => node.uniqueValues);
      console.log('Nodes with unique values:', nodesWithValues);
      
      setTreeData(data.nodeMap);
      messageApi.success('Analysis completed successfully');
    } catch (error) {
      messageApi.error('Failed to analyze the file');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    if (!treeData.length) {
      messageApi.error('No data to export');
      return;
    }

    const dataStr = JSON.stringify(treeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'onix-analysis.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const transformTreeData = (nodes: IOnixNode[]) => {
    let keyCounter = 0;
    const allKeys: string[] = [];
    
    const generateUniqueKey = (path: string, parentPath: string = '') => {
      keyCounter += 1;
      const key = `${parentPath}${path}-${keyCounter}`;
      allKeys.push(key);
      return key;
    };

    const shouldShowValues = (path: string): boolean => {
      const targetPaths = [
        // Combined Product Form and Details
        'ProductFormCombined', 'b012b333',
        // List 1: Notification or update type code
        'a001', 'NotificationType',
        // List 2: Product composition
        'b014', 'ProductComposition',
        // List 3: Record source type code
        'a194', 'RecordSourceType',
        // List 5: Product identifier type
        'b221', 'ProductIDType',
        // List 7: Product form code
        'b012', 'ProductForm',
        // List 9: Product classification type code
        'b274', 'ProductClassificationType',
        // List 12: Trade category code
        'b384', 'TradeCategory',
        // List 17: Contributor role code
        'b035', 'ContributorRole',
        // List 21: Edition type code
        'x419', 'EditionType',
        // List 22: Language role
        'b253', 'LanguageRole',
        // List 23: Extent type code
        'b218', 'ExtentType',
        // List 24: Extent unit code
        'b219', 'ExtentUnit',
        // List 25: Illustration and other content type code
        'b256', 'IllustrationType',
        // List 27: Subject scheme identifier code
        'b067', 'SubjectSchemeIdentifier',
        // List 28: Audience code type
        'b204', 'AudienceCodeType',
        // List 29: Audience code value
        'b206', 'AudienceCodeValue',
        // List 30: Audience range qualifier
        'b074', 'AudienceRangeQualifier',
        // List 32: Complex audience code qualifier
        'b075', 'ComplexAudienceCodeQualifier',
        // List 34: Text format code
        'b034', 'TextFormat',
        // List 41: Prize or award achievement code
        'g129', 'PrizeOrAwardAchievement',
        // List 44: Name code type
        'b233', 'NameCodeType',
        // List 45: Publishing role code
        'b291', 'PublishingRole',
        // List 48: Measure type code
        'c093', 'MeasureType',
        // List 49: Region code
        'b398', 'RegionCode',
        // List 51: Product relation code
        'h208', 'ProductRelationCode',
        // List 53: Returns conditions code type
        'j268', 'ReturnsCodeType',
        // List 55: Date format
        'j260', 'DateFormat',
        // List 57: Unpriced item type code
        'j192', 'UnpricedItemType',
        // List 58: Price type code
        'x462', 'PriceType',
        // List 59: Price type qualifier
        'j261', 'PriceQualifier',
        // List 60: Unit of pricing code
        'j151', 'UnitOfPricing',
        // List 61: Price status code
        'j266', 'PriceStatus',
        // List 62: Tax rate code
        'x470', 'TaxRateCode',
        // List 64: Publishing status
        'b394', 'PublishingStatus',
        // List 65: Product availability
        'j396', 'ProductAvailability',
        // List 68: Market date role
        'j408', 'MarketDateRole',
        // List 71: Sales restriction type code
        'b381', 'SalesRestrictionType',
        // List 73: Price type code
        'x462', 'PriceType',
        // List 74: Language code
        'b252', 'LanguageCode',
        // List 79: Product form feature type
        'b334', 'ProductFormFeatureType',
        // List 80: Product form detail
        'b333', 'ProductFormDetail',
        // List 81: Product content type code
        'b385', 'ContentType',
        // List 82: Bible contents
        'b352', 'BibleContents',
        // List 83: Bible version
        'b353', 'BibleVersion',
        // List 84: Study Bible type
        'b389', 'StudyBibleType',
        // List 85: Bible purpose
        'b354', 'BiblePurpose',
        // List 86: Bible text organization
        'b355', 'BibleTextOrganization',
        // List 87: Bible reference location
        'b356', 'BibleReferenceLocation',
        // List 89: Religious text feature type
        'b358', 'ReligiousTextFeatureType',
        // List 90: Religious text feature code
        'b359', 'ReligiousTextFeature',
        // List 91: Country code
        'b251', 'CountryCode',
        // List 92: Supplier identifier type
        'j345', 'SupplierIDType',
        // List 93: Supplier role
        'j292', 'SupplierRole',
        // List 96: Currency code
        'j152', 'CurrencyCode',
        // List 98: Product form feature value
        'b335', 'ProductFormFeatureValue',
        // List 100: Discount code type
        'j363', 'DiscountCodeType',
        // List 102: Sales outlet identifier type
        'b393', 'SalesOutletIDType',
        // List 121: Text script code
        'b067', 'TextScriptCode',
        // List 138: Sales rights type code
        'b089', 'SalesRightsType',
        // List 139: Sales rights type
        'b089', 'SalesRightsType',
        // List 141: Barcode indicator
        'x312', 'BarcodeIndicator',
        // List 142: Position on product
        'x313', 'PositionOnProduct',
        // List 145: Usage type
        'x318', 'UsageType',
        // List 146: Unit of usage
        'x319', 'UnitOfUsage',
        // List 147: Usage status
        'x320', 'UsageStatus',
        // List 148: Collection type
        'x329', 'CollectionType',
        // List 149: Title element level
        'x409', 'TitleElementLevel',
        // List 150: Product form
        'b012', 'ProductForm',
        // List 151: Contributor place relator
        'x418', 'ContributorPlaceRelator',
        // List 152: Illustrated / not illustrated
        'x422', 'IllustratedNotIllustrated',
        // List 153: Text type
        'x426', 'TextType',
        // List 154: Content audience
        'x427', 'ContentAudience',
        // List 155: Content date role
        'x428', 'ContentDateRole',
        // List 156: Supporting resource file format
        'x435', 'ResourceFileFormat',
        // List 157: Supporting resource mode
        'x437', 'ResourceMode',
        // List 158: Resource content type
        'x436', 'ResourceContentType',
        // List 159: Resource form
        'x441', 'ResourceForm',
        // List 160: Resource version feature type
        'x442', 'ResourceVersionFeatureType',
        // List 161: Resource link type
        'x438', 'ResourceLinkType',
        // List 162: Resource version feature value
        'x439', 'ResourceVersionFeatureValue',
        // List 163: Publishing date role
        'x448', 'PublishingDateRole',
        // List 164: Work relation code
        'x454', 'WorkRelationCode',
        // List 165: Supplier own code type
        'x458', 'SupplierCodeType',
        // List 166: Supply date role
        'x461', 'SupplyDateRole',
        // List 167: Price condition type
        'x463', 'PriceConditionType',
        // List 168: Price condition quantity type
        'x464', 'PriceConditionQuantityType',
        // List 169: Quantity unit
        'x466', 'QuantityUnit',
        // List 170: Stock quantity code type
        'x467', 'StockQuantityCodeType',
        // List 171: Tax type
        'x470', 'TaxType',
        // List 172: Currency zone
        'x475', 'CurrencyZone',
        // List 173: Price date role
        'x476', 'PriceDateRole',
        // List 174: Printed on product
        'x478', 'PrintedOnProduct',
        // List 175: Product form detail
        'b333', 'ProductFormDetail',
        // List 176: Product form feature value
        'b335', 'ProductFormFeatureValue',
        // List 177: Contained item quantity type
        'x466', 'ContainedItemQuantityType',
        // List 178: Supporting resource role
        'x437', 'ResourceRole',
        // List 179: Price code type
        'x465', 'PriceCodeType',
        // List 184: Bible text feature
        'x356', 'BibleTextFeature',
        // List 196: ONIX license type
        'x218', 'LicenseType',
        // List 197: Collection sequence type
        'x479', 'CollectionSequenceType',
        // List 198: Product contact role
        'x482', 'ProductContactRole',
        // List 203: ONIX adult audience rating
        'x481', 'ONIXAdultAudienceRating',
        // List 204: ONIX returns conditions code
        'x460', 'ONIXReturnsConditionsCode'
      ];
      const result = targetPaths.includes(path);
      console.log(`Checking path: ${path}, should show values: ${result}, uniqueValues available:`, nodes.find(n => n.path === path)?.uniqueValues);
      return result;
    };

    const transform = (nodes: IOnixNode[], parentPath: string = ''): any[] => {
      return nodes.map(node => {
        const currentPath = parentPath ? `${parentPath}.${node.path}` : node.path;
        const uniqueKey = generateUniqueKey(node.path, parentPath);
        
        // Debug log for all nodes
        console.log('Processing node:', {
          path: node.path,
          currentPath,
          uniqueValues: node.uniqueValues,
          shouldShow: shouldShowValues(node.path)
        });

        let title;
        if (shouldShowValues(node.path) && node.uniqueValues && node.uniqueValues.length > 0) {
          // Special handling for combined form fields
          const isCombinedForm = node.path === 'ProductFormCombined' || node.path === 'b012b333';
          const displayName = isCombinedForm ? 
            (node.path === 'ProductFormCombined' ? 'Product Form + Details' : 'b012 + b333') : 
            node.path;
          
          title = (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              width: '100%',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0
              }}>
                <span style={{ 
                  fontWeight: 600, 
                  color: isCombinedForm ? '#52c41a' : '#1890ff'
                }}>{displayName}</span>
                <span style={{ fontWeight: 600 }}>({node.count})</span>
                <span style={{ color: '#666' }}>-</span>
              </div>
              <div style={{ 
                color: isCombinedForm ? '#52c41a' : '#1890ff',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                wordBreak: 'break-all'
              }}>
                Values: {node.uniqueValues.join(', ')}
              </div>
            </div>
          );
        } else {
          // For all other elements
          title = (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              width: '100%'
            }}>
              <span>{node.path}</span>
              <span>({node.count})</span>
            </div>
          );
        }
        
        return {
          title,
          key: uniqueKey,
          icon: shouldShowValues(node.path) && node.uniqueValues && node.uniqueValues.length > 0 ? 
            <FileTextOutlined style={{ 
              fontSize: '14px', 
              color: (node.path === 'ProductFormCombined' || node.path === 'b012b333') ? '#52c41a' : '#1890ff' 
            }} /> :
            <FileTextOutlined style={{ fontSize: '14px' }} />,
          children: node.children ? transform(node.children, currentPath) : undefined,
        };
      });
    };

    // Debug log for input nodes
    console.log('Input nodes:', JSON.stringify(nodes, null, 2));
    const transformed = transform(nodes);
    // Debug log for output
    console.log('Transformed tree data:', JSON.stringify(transformed, null, 2));
    return { transformed, allKeys };
  };

  const handleExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys.map(key => key.toString()));
    setAutoExpandParent(false);
  };

  const handleExpandAll = () => {
    if (transformedTreeData.length > 0) {
      const allKeys = getAllKeys(transformedTreeData);
      setExpandedKeys(allKeys);
      setAutoExpandParent(true);
    }
  };

  const handleCollapseAll = () => {
    setExpandedKeys([]);
    setAutoExpandParent(false);
  };

  const getAllKeys = (data: any[]): string[] => {
    const keys: string[] = [];
    const traverse = (nodes: any[]) => {
      nodes.forEach(node => {
        keys.push(node.key);
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
    return keys;
  };

  const handleExpandNext = () => {
    if (transformedTreeData.length === 0) return;

    // Create a map of node depths
    const nodeDepths = new Map<string, number>();
    const getNodeDepths = (nodes: any[], depth: number = 0) => {
      nodes.forEach(node => {
        nodeDepths.set(node.key, depth);
        if (node.children) {
          getNodeDepths(node.children, depth + 1);
        }
      });
    };
    getNodeDepths(transformedTreeData);

    // Find the next unexpanded level
    let nextLevel = 0;
    const expandedDepths = new Set<number>();
    
    expandedKeys.forEach(key => {
      expandedDepths.add(nodeDepths.get(key) || 0);
    });

    // Find the first missing level
    while (expandedDepths.has(nextLevel)) {
      nextLevel++;
    }

    // Get all nodes at or before the next level
    const newExpandedKeys = new Set(expandedKeys);
    const getAllNodesUpToLevel = (nodes: any[], currentDepth: number = 0) => {
      nodes.forEach(node => {
        if (currentDepth <= nextLevel) {
          newExpandedKeys.add(node.key);
          if (node.children) {
            getAllNodesUpToLevel(node.children, currentDepth + 1);
          }
        }
      });
    };

    getAllNodesUpToLevel(transformedTreeData);
    setExpandedKeys([...newExpandedKeys]);
    setAutoExpandParent(false);
  };

  const handleCollapseNext = () => {
    if (transformedTreeData.length === 0 || expandedKeys.length === 0) return;

    // Create a map of node depths
    const nodeDepths = new Map<string, number>();
    const getNodeDepths = (nodes: any[], depth: number = 0) => {
      nodes.forEach(node => {
        nodeDepths.set(node.key, depth);
        if (node.children) {
          getNodeDepths(node.children, depth + 1);
        }
      });
    };
    getNodeDepths(transformedTreeData);

    // Find the deepest expanded level
    let maxDepth = 0;
    expandedKeys.forEach(key => {
      const depth = nodeDepths.get(key) || 0;
      maxDepth = Math.max(maxDepth, depth);
    });

    // Keep all nodes expanded except those at the deepest level
    const newExpandedKeys = expandedKeys.filter(key => {
      const depth = nodeDepths.get(key) || 0;
      return depth < maxDepth;
    });

    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  return (
    <Container>
      {contextHolder}
      <div style={{ padding: '24px', height: '100%', maxWidth: '100%' }}>
        <h1>ONIX XML Analyzer</h1>
        <Space direction="vertical" size="large" style={{ width: '100%', display: 'flex' }}>
          <Space wrap>
            <Upload
              accept=".xml"
              maxCount={1}
              onChange={handleFileUpload}
              showUploadList={true}
              customRequest={customRequest}
              progress={{
                strokeColor: {
                  '0%': '#108ee9',
                  '100%': '#87d068',
                },
                strokeWidth: 3,
                format: (percent) => percent ? `${parseFloat(percent.toFixed(2))}%` : '0%',
              }}
            >
              <Tooltip title="Upload ONIX XML">
                <Button icon={<UploadOutlined />} />
              </Tooltip>
            </Upload>
            <Tooltip title="Analyze">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={!file}
              />
            </Tooltip>
            <Tooltip title="Export JSON">
              <Button
                icon={<ExportOutlined />}
                onClick={handleExport}
                disabled={!treeData.length}
              />
            </Tooltip>
            {treeData.length > 0 && (
              <>
                <Tooltip title="Expand All">
                  <Button
                    icon={<ExpandAltOutlined />}
                    onClick={handleExpandAll}
                  />
                </Tooltip>
                <Tooltip title="Collapse All">
                  <Button
                    icon={<ShrinkOutlined />}
                    onClick={handleCollapseAll}
                  />
                </Tooltip>
                <Tooltip title="Expand Next Level">
                  <Button
                    icon={<DownOutlined />}
                    onClick={handleExpandNext}
                  />
                </Tooltip>
                <Tooltip title="Collapse Last Level">
                  <Button
                    icon={<UpOutlined />}
                    onClick={handleCollapseNext}
                  />
                </Tooltip>
              </>
            )}
          </Space>

          {analyzing && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>Analyzing ONIX file...</p>
            </div>
          )}

          {treeData.length > 0 && (
            <div style={{ 
              background: '#fff', 
              padding: '24px', 
              borderRadius: '8px',
              height: `${treeHeight}px`,
              overflow: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '100%'
            }}>
              <DirectoryTree
                treeData={transformedTreeData}
                showIcon
                showLine={{ showLeafIcon: false }}
                height={treeHeight - 48}
                style={{ flex: 1, maxWidth: '100%' }}
                expandedKeys={expandedKeys}
                onExpand={handleExpand}
                autoExpandParent={autoExpandParent}
              />
            </div>
          )}
        </Space>
      </div>
    </Container>
  );
}; 