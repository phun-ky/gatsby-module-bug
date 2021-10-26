const path = require('path');
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it

exports.onCreateNode = require('./gatsby/on-create-node');
exports.createPages = require('./gatsby/create-pages');
exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        react: path.resolve('./node_modules/react')
      }
    },
    module: {
      rules: [
        {
          test: /\.html$/i,
          loader: 'html-loader'
        }
      ]
    }
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  const typeDefs = `
  type Frontmatter implements Node {
    order: Int
    customPath: String
    componentName: String
    category: String
    editLink: String
    subCategory: String
    title: String
    hideTitle: Boolean
  }

  type Mdx implements Node {
    frontmatter: Frontmatter
    body: String
    rawBody: String
  }
  `;
  createTypes(typeDefs);
};
