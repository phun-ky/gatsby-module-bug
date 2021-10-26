const COLLECTIONS = [
  {
    name: 'docs'
  }
];
const templateToUse = node => {
  const { componentName, category, subCategory, customPath } = node.frontmatter;

  if (
    category &&
    category === 'components' &&
    customPath &&
    customPath.indexOf('components') !== -1 &&
    customPath.indexOf('css') !== -1
  ) {
    return 'css';
  } else if (category && category === 'resources' && subCategory && subCategory === 'icons') {
    return 'wide';
  } else if (node.fields.collection === 'changelog') {
    return 'changelog';
  } else if (node.fields.collection === 'javascript') {
    return 'javascript';
  } else if (node.fields.collection === 'webcomponents') {
    return 'webcomponents';
  } else if (node.fields.collection === 'blog') {
    return 'blog';
  } else if (componentName && componentName !== '') {
    return 'component';
  }

  // return 'page';
  return 'component';
};
const getPath = (collection, customPath, slug, fileAbsolutePath) => {
  let path = customPath || slug;

  if (fileAbsolutePath && fileAbsolutePath.indexOf('CHANGELOG.md') !== -1 && collection === 'docs') {
    path = `/components/${fileAbsolutePath.replace('/CHANGELOG.md', '').split('/').reverse()[0]}`;
    console.log(path, fileAbsolutePath);
  }

  if (collection == 'changelog') path = '/changelog';

  if (collection == 'blog') path = `/blog/${customPath || slug}`;

  return path.replace('//', '/');
};
const getSlug = (collection, slug) => {
  if (collection == 'changelog') return '/changelog';

  return slug.replace('//', '/');
};
const buildPagesCollectionGenerator =
  ({ edges, createPage }) =>
    ({ name }) => {
    // const filteredEdges = filterEdges(name)(edges);
    /**
     * CREATE INDIVIDUAL ITEMS
     */
      edges.forEach((edge, index) => {
        const { fileAbsolutePath, fields } = edge.node;
        const { slug, collection } = fields;
        const { customPath, title, componentName = '', category, subCategory } = edge.node.frontmatter;
        const _is_changelog = collection == 'docs' && fileAbsolutePath.indexOf('CHANGELOG') !== -1;
        const previous = index === edges.length - 1 ? null : edges[index + 1].node;
        const next = index === 0 ? null : edges[index - 1].node;
        const path = getPath(collection, customPath, slug, fileAbsolutePath);
        const slugToUse = getSlug(collection, slug);
        const customPathToUse = getPath(collection, customPath, slug, fileAbsolutePath);
        const _component_name = _is_changelog ? path.split('/').reverse()[0] : componentName;
        const _title = _is_changelog ? 'Changelog' : title;
        const _sub_category = _is_changelog ? componentName : subCategory;
        const _category = _is_changelog ? 'components' : category;

        createPage({
          path,
          component: require.resolve(`../src/templates/${templateToUse(edge.node)}.js`),
          context: {
            title: _title,
            componentName: _component_name,
            subCategory: _sub_category,
            category: _category,
            customPath: customPathToUse,
            collection,
            slug: slugToUse,
            previous,
            next
          }
        });
      });
    };

module.exports = async function ({ actions, graphql }) {
  const { createPage, createRedirect } = actions;
  const redirectBatch2 = [
    { f: '/components/atoms', t: '/components' },
    { f: '/components/molecules', t: '/components' },
    { f: '/components/organisms', t: '/components' },
    { f: '/components/icons', t: '/components/media/icons/css' },
    { f: '/components/media/icons', t: '/components/media/icons/css' },
    { f: '/components/color', t: '/components/color/css' },
    { f: '/components/breakpoint', t: '/components/layout/breakpoint/css' },
    { f: '/components/layout/breakpoint', t: '/components/layout/breakpoint/css' },
    { f: '/components/text/typography', t: '/components/text/typography/css' },
    { f: '/components/typography', t: '/components/text/typography/css' },
    { f: '/components/util', t: '/components/util/css' },
    { f: '/components/crosslinks', t: '/components/cards/navigational-card' },
    { f: '/components/selection-controls', t: '/components/inputs/checkbox' },
    { f: '/components/expandable', t: '/components/page-sections/panel' },
    { f: '/components/card', t: '/components/cards/card/js' },
    { f: '/components/dropdown', t: '/components/inputs/dropdown-select' },
    { f: '/components/menu', t: '/components/navigation/dropdown-menu' },
    { f: '/components/footer', t: '/components/page-sections/global-footer' },
    { f: '/design/guidelines/patterns', t: '/design/guidelines' },
    { f: '/getting-started', t: '/' },
    { f: '/page-templates', t: '/' }
  ];

  redirectBatch2.forEach(({ f, t }) => {
    createRedirect({
      fromPath: f,
      redirectInBrowser: true,
      toPath: t
    });
  });

  const { data } = await graphql(`
    query {
      allMarkdownRemark(sort: { fields: [frontmatter___order], order: ASC }) {
        edges {
          node {
            id
            fields {
              collection
              slug
            }
            frontmatter {
              title
              componentName
              subCategory
              category
              editLink
              customPath
              order
            }
            fileAbsolutePath
          }
        }
      }
    }
  `);
  const pagesCollectionGenerator = buildPagesCollectionGenerator({
    edges: data.allMarkdownRemark.edges,
    createPage
  });

  COLLECTIONS.forEach(pagesCollectionGenerator);
};
