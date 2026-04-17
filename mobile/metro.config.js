const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root
const projectRoot = __dirname;
// Our root is the parent directory
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the root directory
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the root node_modules if they are not in the mobile node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Keep the default hierarchical lookup (recommended by expo-doctor)
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
