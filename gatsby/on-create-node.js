/**
 * @description Get the link for the component from packageName
 *
 * @param {String} packageName
 * @return {String}
 */
const getDocPath = packageName => {
  if (['button', 'contextual-menu', 'floating-action-button', 'icon-button'].includes(packageName)) {
    return '/components/actions';
  } else if (['disclosure-card', 'editorial-card', 'card', 'info-card', 'navigational-card'].includes(packageName)) {
    return '/components/cards';
  } else if (
    ['alert-banner', 'consent-banner', 'loader', 'progress-tracker', 'status-indicator', 'toast'].includes(packageName)
  ) {
    return '/components/feedback';
  } else if (
    [
      'autocomplete',
      'checkbox',
      'datepicker',
      'dropdown-filter',
      'dropdown-select',
      'file-upload',
      'input-fields',
      'input-label',
      'numeric-stepper',
      'phonenumber',
      'radio-buttons',
      'search-field',
      'segmented-control',
      'slider',
      'textarea',
      'toggle'
    ].includes(packageName)
  ) {
    return '/components/inputs';
  } else if (['breakpoint', 'grid'].includes(packageName)) {
    return '/components/layout';
  } else if (['avatar', 'icons', 'logo', 'video'].includes(packageName)) {
    return '/components/media';
  } else if (
    [
      'accordion-menu',
      'breadcrumbs',
      'dropdown-menu',
      'link',
      'link-list',
      'pagination',
      'shortcuts',
      'sidebar-menu',
      'tabs',
      'tooltip-menu'
    ].includes(packageName)
  ) {
    return '/components/navigation';
  } else if (['help-tooltip', 'info-tooltip', 'modal', 'dialog', 'popover', 'tooltip'].includes(packageName)) {
    return '/components/overlay';
  } else if (
    [
      'banner',
      'faq',
      'global-footer',
      'global-header',
      'global-minimal-header',
      'header',
      'hero',
      'hero-navigation',
      'panel',
      'quick-facts',
      'split'
    ].includes(packageName)
  ) {
    return '/components/page-sections';
  } else if (['data-tables', 'product-matrix-table'].includes(packageName)) {
    return '/components/tables';
  } else if (['blockquote', 'tag', 'typography'].includes(packageName)) {
    return '/components/text';
  }

  return '/components';
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const { createFilePath } = require('gatsby-source-filesystem');
const getBasePath = collection => {
  if (collection === 'blog') {
    return 'content';
  } else {
    return 'src/docs';
  }
};
const getSlug = (node, getNode, collection) => {
  const basePath = getBasePath(collection);

  return createFilePath({ node, getNode, basePath, trailingSlash: false });
};

module.exports = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;

  let collection;

  if (node.fileAbsolutePath && node.internal.type == 'MarkdownRemark') {
    collection = getNode(node.parent).sourceInstanceName;

    const { id, children, fields, parent, internal, frontmatter, excerpt, fileAbsolutePath } = node;
    const _is_changelog =
      (collection == 'docs' || collection == 'javascript' || collection == 'webcomponents') &&
      fileAbsolutePath.indexOf('CHANGELOG.md') !== -1;

    if (_is_changelog) {
      let _custom_path;
      let _title;
      let _component_name;

      if (fileAbsolutePath && fileAbsolutePath.indexOf('CHANGELOG.md') !== -1 && collection === 'docs') {
        _component_name = fileAbsolutePath.replace('/CHANGELOG.md', '').split('/').reverse()[0];
        _title = _component_name.capitalize();
        _custom_path = `/${getDocPath(_component_name)}/css`;
      } else if (fileAbsolutePath && fileAbsolutePath.indexOf('CHANGELOG.md') !== -1 && collection === 'javascript') {
        _component_name = fileAbsolutePath.replace('/CHANGELOG.md', '').split('/').reverse()[0];
        _title = _component_name.capitalize();
        _custom_path = `/${getDocPath(_component_name)}/js`;
      } else if (
        fileAbsolutePath &&
        fileAbsolutePath.indexOf('CHANGELOG.md') !== -1 &&
        collection === 'webcomponents'
      ) {
        _component_name = fileAbsolutePath.replace('/CHANGELOG.md', '').split('/').reverse()[0];
        _title = _component_name.capitalize();
        _custom_path = `/${getDocPath(_component_name)}/webcomponent`;
      }

      createNodeField({
        node,
        name: 'collection',
        value: collection
      });
      createNodeField({
        node,
        name: 'slug',
        value: `${_custom_path}`
      });
      createNodeField({
        node,
        name: 'customPath',
        value: `${_custom_path}`
      });
      createNodeField({
        node,
        name: 'title',
        value: `${_title}`
      });
    }
  }
  //

  // no type will hit this..
  if (node.internal.type === 'MarkdownRemark') {
    collection = getNode(node.parent).sourceInstanceName;

    const slug = getSlug(node, getNode, collection);

    createNodeField({
      node,
      name: 'collection',
      value: collection
    });
    createNodeField({
      node,
      name: 'slug',
      value: `${slug}`
    });
  }
};
