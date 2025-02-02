import { NextRequest, NextResponse } from 'next/server';
import { OnixAnalysis } from '@/app/models/OnixAnalysis';
import { parseXmlAsync, cleanXmlNode, isOnixReferenceFormat, getProductsFromOnix } from '@/app/utils/xmlParser';
import connectToDatabase from '@/app/utils/mongodb';

// Configure body size limit to 100MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    // Ensure database connection
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const xmlData = await file.text();
    console.log('Received XML data length:', xmlData.length);
    
    const format = isOnixReferenceFormat(xmlData) ? 'reference' : 'short';
    console.log('Detected ONIX format:', format);
    
    let parsedData;
    try {
      parsedData = cleanXmlNode(await parseXmlAsync(xmlData));
      console.log('Successfully parsed XML data');
    } catch (parseError) {
      console.error('XML parsing error:', parseError);
      return NextResponse.json({ error: 'Failed to parse XML file' }, { status: 400 });
    }
    
    let products;
    try {
      products = getProductsFromOnix(parsedData);
      console.log('Found products:', products.length);
    } catch (productsError) {
      console.error('Error extracting products:', productsError);
      return NextResponse.json({ error: 'Failed to extract products from ONIX' }, { status: 400 });
    }

    interface NodeCounts {
      counts: Map<string, number>;
      uniqueValues: Map<string, Set<string>>;
    }

    // Define elements that should have their values collected
    const codelistElements = new Set([
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
    ]);

    function shouldCollectValues(path: string): boolean {
      return codelistElements.has(path);
    }

    function processProductFormDetails(product: any): string | undefined {
      // Handle both possible locations of ProductFormDetail/b333
      const details = product.b333 || product.ProductFormDetail;
      if (!details) return undefined;

      // If it's an array, join with '|', otherwise return single value
      return Array.isArray(details) ? details.sort().join('|') : details;
    }

    function processCombinedFormAndDetail(obj: any): string | undefined {
      const form = obj.b012 || obj.ProductForm;
      const details = obj.b333 || obj.ProductFormDetail;
      
      if (!form) return undefined;
      
      const detailsArray = Array.isArray(details) ? details : details ? [details] : [];
      return `${form}${detailsArray.length > 0 ? '+' + detailsArray.sort().join('|') : ''}`;
    }

    function countNodes(obj: any, parentPath = '', result: NodeCounts = { 
      counts: new Map(), 
      uniqueValues: new Map() 
    }): NodeCounts {
      if (typeof obj !== 'object' || obj === null) return result;

      // Debug log the current object being processed
      console.log('Processing object:', {
        parentPath,
        keys: Object.keys(obj),
        hasProductForm: obj.b012 || obj.ProductForm,
        hasProductFormDetail: obj.b333 || obj.ProductFormDetail
      });

      // Define HTML and formatting related tags/attributes to ignore
      const htmlRelatedPaths = new Set([
        'p', 'br', 'div', 'span', 'a', 'img', 'ul', 'li', 'ol', 'strong', 'em', 'i', 'b',
        'textformat', 'language', 'dateformat', 'href', 'src', 'style', 'class', 'id',
        'CDATA', 'html', 'body', 'head', 'script', 'link', 'meta', 'title', 'h1', 'h2', 'h3',
        'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot'
      ]);

      // Special handling for combined ProductForm and ProductFormDetail
      if (obj.b012 || obj.ProductForm || obj.b333 || obj.ProductFormDetail) {
        const currentPath = parentPath ? `${parentPath}` : '';
        const pathParts = currentPath.split('.');
        const isHtmlRelated = pathParts.some(part => htmlRelatedPaths.has(part.toLowerCase()));
        
        if (!isHtmlRelated) {
          const combinedValue = processCombinedFormAndDetail(obj);
          if (combinedValue) {
            // Add to the appropriate format path
            const combinedPath = format === 'reference' ? 'ProductFormCombined' : 'b012b333';
            if (!result.uniqueValues.has(combinedPath)) {
              result.uniqueValues.set(combinedPath, new Set());
              result.counts.set(combinedPath, 0);
            }
            result.uniqueValues.get(combinedPath)?.add(combinedValue);
            result.counts.set(combinedPath, (result.counts.get(combinedPath) || 0) + 1);
          }
        }
      }

      Object.keys(obj).forEach(key => {
        const currentPath = parentPath ? `${parentPath}.${key}` : key;
        
        // Check if any part of the path contains HTML-related terms
        const pathParts = currentPath.split('.');
        const isHtmlRelated = pathParts.some(part => htmlRelatedPaths.has(part.toLowerCase()));
        
        if (!isHtmlRelated) {
          result.counts.set(currentPath, (result.counts.get(currentPath) || 0) + 1);

          // If this is a codelist element, collect its value
          if (shouldCollectValues(key)) {
            const value = obj[key];
            console.log('Found codelist element:', {
              key,
              value,
              currentPath,
              isArray: Array.isArray(value)
            });

            if (value) {
              if (!result.uniqueValues.has(key)) {
                result.uniqueValues.set(key, new Set());
              }
              if (Array.isArray(value)) {
                value.forEach(v => {
                  console.log('Adding array value:', { key, value: v });
                  result.uniqueValues.get(key)?.add(String(v));
                });
              } else {
                console.log('Adding single value:', { key, value });
                result.uniqueValues.get(key)?.add(String(value));
              }
            }
          }
        }

        if (Array.isArray(obj[key])) {
          obj[key].forEach((item: any) => {
            countNodes(item, currentPath, result);
          });
        } else if (typeof obj[key] === 'object') {
          countNodes(obj[key], currentPath, result);
        }
      });

      // Debug log the current state of uniqueValues
      console.log('Current uniqueValues:', {
        parentPath,
        values: Object.fromEntries(
          Array.from(result.uniqueValues.entries()).map(([k, v]) => [k, Array.from(v)])
        )
      });

      return result;
    }

    function buildTreeStructure(nodeCounts: NodeCounts) {
      const root: { [key: string]: any } = {};

      // First pass: build the basic tree structure
      Array.from(nodeCounts.counts.entries()).forEach(([path, count]) => {
        const parts = path.split('.');
        let current = root;
        let currentPath = '';

        parts.forEach((part, index) => {
          currentPath = currentPath ? `${currentPath}.${part}` : part;
          if (!current[currentPath]) {
            const uniqueValues = nodeCounts.uniqueValues.get(part);
            current[currentPath] = {
              path: part,
              count: nodeCounts.counts.get(currentPath) || 0,
              uniqueValues: uniqueValues ? Array.from(uniqueValues) : undefined,
              children: {},
            };
          }
          current = current[currentPath].children;
        });
      });

      // Second pass: insert combined nodes after their respective detail nodes
      const combinedPath = format === 'reference' ? 'ProductFormCombined' : 'b012b333';
      const detailPath = format === 'reference' ? 'ProductFormDetail' : 'b333';
      const formPath = format === 'reference' ? 'ProductForm' : 'b012';
      const combinedValues = nodeCounts.uniqueValues.get(combinedPath);
      const combinedCount = nodeCounts.counts.get(combinedPath);

      if (combinedValues && combinedCount) {
        // Find the parent node that contains both form and detail nodes
        const findAndInsertAfterDetail = (node: { [key: string]: any }, parentPath: string = '') => {
          const entries = Object.entries(node);
          for (const [key, value] of entries) {
            // Check if this node contains both form and detail
            if (value.children && (
              Object.values(value.children).some(child => (child as any).path === formPath) &&
              Object.values(value.children).some(child => (child as any).path === detailPath)
            )) {
              // Insert the combined node after the detail node
              const newChildren: { [key: string]: any } = {};
              Object.entries(value.children).forEach(([childKey, childValue]) => {
                newChildren[childKey] = childValue;
                if ((childValue as any).path === detailPath) {
                  // Add the combined node right after
                  const combinedKey = `${key}.${combinedPath}`;
                  newChildren[combinedKey] = {
                    path: combinedPath,
                    count: combinedCount,
                    uniqueValues: Array.from(combinedValues),
                    children: {},
                  };
                }
              });
              value.children = newChildren;
              return true;
            }
            if (value.children && Object.keys(value.children).length > 0) {
              if (findAndInsertAfterDetail(value.children, key)) {
                return true;
              }
            }
          }
          return false;
        };

        findAndInsertAfterDetail(root);
      }

      function convertToArray(node: { [key: string]: any }): any[] {
        return Object.values(node).map(n => ({
          path: n.path,
          count: n.count,
          uniqueValues: n.uniqueValues,
          children: Object.keys(n.children).length > 0
            ? convertToArray(n.children)
            : undefined,
        }));
      }

      const result = convertToArray(root);
      return result;
    }

    const nodeData = countNodes(parsedData);
    const treeStructure = buildTreeStructure(nodeData);

    const analysis = await OnixAnalysis.create({
      fileName: file.name,
      format,
      nodeMap: treeStructure,
      totalRecords: products.length,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error processing ONIX file:', error);
    return NextResponse.json(
      { error: 'Failed to process ONIX file' },
      { status: 500 }
    );
  }
} 