export type ProductOption = Array<{
  name: string;
  values: Array<{
    name: string;
  }>;
}>;

export type ProductRequest = {
  title: string;
  descriptionHtml: string;
  productOptions: ProductOption;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  options: Array<{
    id: string;
    name: string;
    optionValues: Array<{
      id: string;
      name: string;
    }>;
  }>;
};

export type ProductResponse = {
  productCreate: {
    product: Product;
  };
};

export type VariantRequest = {
  productId: string;
  variants: Array<{
    id?: string;
    price: string;
    optionValues: Array<{
      name: string;
      optionId: string;
    }>;
  }>;
};

export type ProductMediaRequest = {
  alt: string;
  mediaContentType: "IMAGE";
  originalSource: string;
};

export type ProductMediaResponse = {
  productCreateMedia: {
    media: Array<{
      alt: string;
      mediaContentType: "IMAGE";
      status: string;
    }>;
    product: {
      id: string;
      title: string;
    };
  };
};

export type MediaVariantRequest = {
  productId: string;
  variantMedia: Array<{
    mediaIds: Array<string>;
    variantId: string;
  }>;
};

export type ProductWithMedia = Product & {
  media: {
    edges: Array<{
      node: {
        image: {
          id: string;
          url: string;
        };
      };
    }>;
  };
};

export type ProductWithMainImage = ProductWithMedia & {
  image: string;
};

export type ProductWithMediaResponse = {
  product: ProductWithMedia;
};

export type VariantResponse = {
  productVariants: {
    nodes: Array<{
      id: string;
      title: string;
    }>;
  };
};

export type MediaResponse = {
  productCreateMedia: {
    media: Array<{
      id: string;
    }>;
  };
};
