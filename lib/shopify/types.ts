export type ShopifyImage = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

export type ShopifyPriceRange = {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
};

export type ShopifyProductVariant = {
  id: string;
  title: string;
  price: ShopifyMoney;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  tags: string[];
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyProductVariant }[] };
  priceRange: ShopifyPriceRange;
  availableForSale: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShopifyCollection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: { edges: { node: ShopifyProduct }[] };
};

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: ShopifyMoney;
    product: ShopifyProduct;
    selectedOptions: { name: string; value: string }[];
    image: ShopifyImage | null;
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { edges: { node: ShopifyCartLine }[] };
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
  };
};

export type ShopifyCartLineInput = {
  merchandiseId: string;
  quantity: number;
};

export type ShopifyCartLineUpdateInput = {
  id: string;
  merchandiseId: string;
  quantity: number;
};
