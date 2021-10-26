var remark = require('remark');
var visit = require('unist-util-visit');
var path = require('path');
var glob = require('glob');
var mdx = require('remark-mdx');

const activeEnv = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `.env.${activeEnv}`
});

const {
  ifDesignSystemPath,
  ifDesignSystemPackagesGlob,
  ifDesignSystemPackageDocPath,
  ifDesignSystemPackageChangelogPath,
  ifDesignSystemChangelogPath,
  ifDesignComponentsJavascriptPackageDocPath,
  ifDesignSystemJavascriptChangelogPath,
  ifDesignComponentsJavascriptPackagesGlob,
  ifDesignComponentsWebcomponentPackageDocPath,
  ifDesignSystemWebcomponentChangelogPath,
  ifDesignComponentsWebcomponentPackagesGlob
} = require('./gb.config.js');
const plugins = [
  'gatsby-plugin-react-helmet',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: `${__dirname}/src/images`
    }
  },
  {
    resolve: 'gatsby-plugin-google-tagmanager',
    options: {
      id: process.env.GOOGLE_TAG_MANAGER_ID,

      // Include GTM in development.
      // Defaults to false meaning GTM will only be loaded in production.
      includeInDevelopment: true,

      // datalayer to be set before GTM is loaded
      // should be an object or a function that is executed in the browser
      // Defaults to null
      defaultDataLayer: { platform: 'gatsby' }
    }
  },
  'gatsby-transformer-sharp',
  'gatsby-plugin-sharp',
  'gatsby-plugin-twitter',
  {
    resolve: 'gatsby-plugin-stylus',
    options: {
      include: [
        './src/',
        './node_modules/',
        path.resolve(__dirname, 'node_modules'),
        `${ifDesignSystemPath}/core/src/`,
        `${ifDesignSystemPath}/color/src/`,
        `${ifDesignSystemPath}/breakpoint/src/`,
        `${ifDesignSystemPath}/typography/src/`,
        `${ifDesignSystemPath}/grid/src/`,
        `${ifDesignSystemPath}/icons/src/`,
        `${ifDesignSystemPath}/util/src/`,
        `${ifDesignSystemPath}/input-fields/src/`,
        `${ifDesignSystemPath}/logo/src/`,
        `${ifDesignSystemPath}/footer/src/`,
        `${ifDesignSystemPath}/navigational-card/src/`,
        `${ifDesignSystemPath}/consent-banner/src/`,
        `${ifDesignSystemPath}/button/src/`,
        `${ifDesignSystemPath}/dropdown-select/src/`,
        `${ifDesignSystemPath}/radio-buttons/src/`,
        `${ifDesignSystemPath}/checkbox/src/`,
        `${ifDesignSystemPath}/toggle/src/`,
        `${ifDesignSystemPath}/tooltip/src/`,
        `${ifDesignSystemPath}/popover/src/`,
        `${ifDesignSystemPath}/hero/src/`,
        `${ifDesignSystemPath}/modal/src/`,
        `${ifDesignSystemPath}/shortcuts/src/`,
        `${ifDesignSystemPath}/quick-facts/src/`,
        `${ifDesignSystemPath}/product-matrix-table/src/`,
        `${ifDesignSystemPath}/loader/src/`,
        `${ifDesignSystemPath}/panel/src/`,
        `${ifDesignSystemPath}/datepicker/src/`,
        `${ifDesignSystemPath}/breadcrumbs/src/`,
        `${ifDesignSystemPath}/alert-banner/src/`,
        `${ifDesignSystemPath}/link/src/`,
        `${ifDesignSystemPath}/tabs/src/`,
        `${ifDesignSystemPath}/banner/src/`,
        `${ifDesignSystemPath}/video/src/`,
        `${ifDesignSystemPath}/file-upload/src/`,
        `${ifDesignSystemPath}/menu/src/`
      ]
    }
  },

  {
    resolve: 'gatsby-plugin-manifest',
    options: {
      name: 'If Design System',
      short_name: 'if-ds',
      start_url: '/',
      background_color: '#e8e0d9',
      theme_color: '#331e11',
      display: 'minimal-ui',
      icon: 'node_modules/@if-design-system/logo/src/images/meta/favicon-512x512.png' // This path is relative to the root of the site.
    }
  },
  'gatsby-plugin-remove-serviceworker'
  // 'gatsby-plugin-offline'
];
const elasticFieldsToIndex = [
  'title',
  'collection',
  'path',
  'customPath',
  'slug',
  'excerpt',
  'content',
  'category',
  'subCategory',
  'componentName'
];
/**
 *
 * @param tree
 * @return {string} content
 */
const getTextContent = tree => {
  // eslint-disable-next-line no-unused-vars
  let content = '';

  visit(tree, 'text', node => {
    content += ` ${node.value}`;
  });

  return content;
};
/**
 *
 * @param node
 * @return {*}
 */
const getMdxTree = node => {
  const frontmatterEndIndex = node.rawBody.indexOf('\n---') + 5;
  const bodyWithoutFrontmatter = node.rawBody.slice(frontmatterEndIndex, node.rawBody.length);

  return remark().use(mdx).parse(bodyWithoutFrontmatter);
};
const getMarkdownTree = node => remark().parse(node.rawMarkdownBody);
/**
 *
 * @param node
 * @return {string}
 */
const markdownExcerpt = node => {
  const excerptLength = 60; // Hard coded excerpt length
  const tree = getMarkdownTree(node);
  const excerpt = getTextContent(tree);

  return excerpt.slice(0, excerptLength) + '…';
};
/**
 *
 * @param node
 * @return {string}
 */
const markdownContent = node => {
  const tree = getMarkdownTree(node);

  return getTextContent(tree);
};
/**
 *
 * @param node
 * @return {string}
 */
const mdxExcerpt = node => {
  const tree = getMdxTree(node);
  const excerptLength = 60; // Hard coded excerpt length
  const excerpt = getTextContent(tree);

  return excerpt.slice(0, excerptLength) + '…';
};
/**
 *
 * @param node
 * @return {string}
 */
const mdxContent = node => {
  const tree = getMdxTree(node);

  return getTextContent(tree);
};
const elasticResolver = (excerpt, content) => {
  return {
    excerpt: node => excerpt(node),
    content: node => content(node),
    collection: node => {
      if (node && node.fields) {
        return node.fields.collection;
      }
    },
    title: node => {
      if (node && node.fields) {
        return node.fields.collection === 'changelog' ? 'Changelog' : node.frontmatter.title;
      }
    },
    category: node => node.frontmatter.category,
    subCategory: node => node.frontmatter.subCategory,
    componentName: node => node.frontmatter.componentName || '',
    path: node => {
      if (node && node.fields && node.fields.collection === 'changelog') {
        return '/changelog';
      } else if (node && node.fields && node.fields.collection === 'blog') {
        return `/blog${node.fields.slug.replace('//', '/')}`;
      } else {
        return node.frontmatter.customPath;
      }
    }
  };
};

var packagePlugins = function () {
  var pkgs = glob.sync(ifDesignSystemPackagesGlob);

  pkgs.forEach(pkg => {
    const baseName = path.basename(pkg);

    if (
      baseName !== 'bundle' &&
      !['-js', '-react', '-webcomponent', '-android', '-ios'].some(substring => baseName.includes(substring))
    ) {
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'docs',
          path: ifDesignSystemPackageDocPath(baseName)
        }
      });
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'docs',
          path: ifDesignSystemPackageChangelogPath(baseName)
        }
      });
      plugins.push('gatsby-plugin-mdx');
    }
  });

  var jsPkgs = glob.sync(ifDesignComponentsJavascriptPackagesGlob);

  jsPkgs.forEach(pkg => {
    const baseName = path.basename(pkg);

    if (baseName !== 'bundle') {
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'javascript',
          path: ifDesignComponentsJavascriptPackageDocPath(baseName)
        }
      });
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'javascript',
          path: ifDesignSystemJavascriptChangelogPath(baseName)
        }
      });
    }
  });

  var wcPkgs = glob.sync(ifDesignComponentsWebcomponentPackagesGlob);

  wcPkgs.forEach(pkg => {
    const baseName = path.basename(pkg);

    if (baseName !== 'bundle') {
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'webcomponents',
          path: ifDesignComponentsWebcomponentPackageDocPath(baseName)
        }
      });
      plugins.push({
        resolve: 'gatsby-source-filesystem',
        options: {
          name: 'webcomponents',
          path: ifDesignSystemWebcomponentChangelogPath(baseName)
        }
      });
    }
  });

  plugins.push({
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'changelog',
      path: ifDesignSystemChangelogPath
    }
  });
  plugins.push({
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'blog',
      path: path.resolve(__dirname, './blog/content')
    }
  });
  plugins.push({
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: '@weknow/gatsby-remark-codepen',
          options: {
            theme: 'dark',
            height: 400,
            defaultTab: 'result'
          }
        },
        {
          resolve: 'gatsby-remark-images',
          options: {
            // It's important to specify the maxWidth (in pixels) of
            // the content container as this plugin uses this as the
            // base for generating different widths of each image.
            maxWidth: 1280
          }
        },
        {
          resolve: 'gatsby-remark-copy-linked-files'
        },
        {
          resolve: 'gatsby-remark-autolink-headers',
          options: {
            removeAccents: true,
            isIconAfterHeader: true,
            enableCustomId: true,
            icon: '<svg aria-hidden="true" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><title>link</title><g class="nc-icon-wrapper" stroke-linecap="square" stroke-linejoin="miter" stroke-width="1.5" fill="#331e11" stroke="#331e11"><path d="M16,20.644A6.968,6.968,0,0,1,13.1,18.9h0a7,7,0,0,1,0-9.9l4.95-4.95a7,7,0,0,1,9.9,0h0a7,7,0,0,1,0,9.9L24.9,17" fill="none" stroke="#331e11" stroke-miterlimit="10"/> <path data-color="color-2" d="M16,11.356A6.968,6.968,0,0,1,18.9,13.1h0a7,7,0,0,1,0,9.9l-4.95,4.95a7,7,0,0,1-9.9,0h0a7,7,0,0,1,0-9.9L7.1,15" fill="none" stroke-miterlimit="10"/></g></svg>'
          }
        },
        {
          resolve: 'gatsby-remark-prismjs'
        },
        {
          resolve: 'gatsby-remark-classes',
          options: {
            classMap: {
              'heading[depth=1]': 'sg if heading largest',
              'heading[depth=2]': 'sg if heading large',
              'heading[depth=3]': 'sg if heading smallest',
              'heading[depth=4]': 'sg if heading smallest',
              'heading[depth=5]': 'sg if heading smallest',
              'heading[depth=6]': 'sg if heading smallest',
              strong: 'if',
              table: 'if table filled',
              tableRow: 'if',
              tableCell: 'if',
              link: 'if',
              html: 'if',
              blockquote: 'if',
              emphasis: 'if',
              paragraph: 'if',
              'list[ordered=false]': 'if list',
              'list[ordered=true]': 'if',
              listItem: 'if'
            }
          }
        }
      ]
    }
  });
  plugins.push({
    resolve: 'gatsby-plugin-catch-links'
  });
  plugins.push({
    resolve: '@gatsby-contrib/gatsby-plugin-elasticlunr-search',
    options: {
      // Fields to index
      fields: elasticFieldsToIndex,
      // How to resolve each field`s value for a supported node type
      resolvers: {
        // For any node of type MarkdownRemark, list how to resolve the fields` values
        MarkdownRemark: elasticResolver(markdownExcerpt, markdownContent),
        // For any node of type Mdx, list how to resolve the fields` values
        Mdx: elasticResolver(mdxExcerpt, mdxContent)
      }
    }
  });
};

packagePlugins();

module.exports = {
  siteMetadata: {
    title: 'If Design System',
    description:
      'The If Design System is a resource for designers, developers and anyone creating digital solutions or content in If, providing a common language and visual presence.',
    author: 'If P&C Insurance',
    codeRepository: {
      web: 'https://dev.azure.com/if-it/If%20Design%20Hub/_git/if-design-system',
      git: 'git@ssh.dev.azure.com:v3/if-it/If%20Design%20Hub/if-design-system'
    },
    siteRepository: {
      web: 'https://dev.azure.com/if-it/If%20Design%20Hub/_git/if-design-system-site',
      git: 'git@ssh.dev.azure.com:v3/if-it/If%20Design%20Hub/if-design-system-site'
    }
  },
  plugins: plugins
};
