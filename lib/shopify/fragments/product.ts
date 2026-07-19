export const productFragment = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    description
    descriptionHtml
    productType
    vendor
    tags
    availableForSale
    createdAt
    updatedAt
    images(first: 10) {
      edges {
        node {
          id
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 25) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
  }
`;

export const collectionFragment = /* GraphQL */ `
  fragment CollectionFields on Collection {
    id
    handle
    title
    description
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 50) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;
