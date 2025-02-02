import { FileSearchOutlined } from '@ant-design/icons';

export const routes = {
  path: '/onix-analyzer',
  name: 'ONIX Analyzer',
  icon: FileSearchOutlined,
  element: () => import('./OnixAnalyzer').then(mod => ({ default: mod.OnixAnalyzer })),
}; 