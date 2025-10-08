import {
  FileRequest,
  StagedFileRequest,
  StagedFileResponse,
} from "@/types/file";
import { PageInfo } from "@/types/page";
import {
  MediaResponse,
  MediaVariantRequest,
  ProductMediaRequest,
  ProductRequest,
  ProductResponse,
  ProductWithMediaResponse,
  VariantRequest,
  VariantResponse,
} from "@/types/product";
import { AdminApiContext } from "@shopify/shopify-app-react-router/server";

export async function stagedUploadsCreate(
  admin: AdminApiContext,
  input: StagedFileRequest[],
): Promise<StagedFileResponse> {
  const response = await admin.graphql(
    `#graphql
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        input,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function createFiles(
  admin: AdminApiContext,
  files: FileRequest[],
) {
  const response = await admin.graphql(
    `#graphql
  mutation fileCreate($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        alt
        createdAt
        ... on MediaImage {
          image {
            width
            height
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        files,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function createProduct(
  admin: AdminApiContext,
  product: ProductRequest,
): Promise<ProductResponse> {
  const response = await admin.graphql(
    `#graphql
  mutation productCreate($product: ProductCreateInput!) {
    productCreate(product: $product) {
      product {
        id
        title
        description
        options {
          id
          name
          optionValues {
            id
            name
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        product,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function createProductMedia(
  admin: AdminApiContext,
  productId: string,
  media: ProductMediaRequest[],
): Promise<MediaResponse> {
  const response = await admin.graphql(
    `#graphql
  mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
    productCreateMedia(media: $media, productId: $productId) {
      media {
        id
      }
      mediaUserErrors {
        field
        message
      }
      product {
        id
        title
      }
    }
  }`,
    {
      variables: {
        media,
        productId,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function getProductById(
  admin: AdminApiContext,
  productId: string,
  first: number,
): Promise<ProductWithMediaResponse> {
  const response = await admin.graphql(
    `#graphql
  query GetProductMedia($productId: ID!, $first: Int!) {
  product(id: $productId) {
    id
    title
    description
    media(first: $first) {
      edges {
        node {
          ... on MediaImage {
            image {
              id
              url
            }
          }
        }
      }
    }
    options {
      id
      name
      optionValues {
        id
        name
      }
    }
  }
}`,
    {
      variables: {
        productId,
        first,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function createProductVariants(
  admin: AdminApiContext,
  { productId, variants }: VariantRequest,
) {
  const response = await admin.graphql(
    `#graphql
  mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkCreate(productId: $productId, variants: $variants) {
      productVariants {
        id
        title
        selectedOptions {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        productId,
        variants,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function getListProductVariants(
  admin: AdminApiContext,
  productId: string,
  first: number,
): Promise<VariantResponse> {
  const response = await admin.graphql(
    `#graphql
  query ProductVariantsList($first: Int!, $query: String) {
    productVariants(first: $first, query: $query) {
      nodes {
        id
        title
      }
    }
  }`,
    {
      variables: {
        first,
        query: `product_id:${productId}`,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function updateProductVariants(
  admin: AdminApiContext,
  { productId, variants }: VariantRequest,
) {
  const response = await admin.graphql(
    `#graphql
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
      }
      productVariants {
        id
        metafields(first: 2) {
          edges {
            node {
              namespace
              key
              value
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
    {
      variables: {
        productId,
        variants,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function appendMediaToProductVariant(
  admin: AdminApiContext,
  { productId, variantMedia }: MediaVariantRequest,
) {
  const response = await admin.graphql(
    `#graphql
  mutation productVariantAppendMedia($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
    productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
      product {
        id
      }
    }
  }`,
    {
      variables: {
        productId,
        variantMedia,
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export async function getProducts(
  admin: AdminApiContext,
  queryOption: {
    first: number;
    after?: string;
  } & {
    last: number;
    before: string;
  },
): Promise<ProductWithMediaResponse & { pageInfo: PageInfo }> {
  const response = await admin.graphql(
    `#graphql
  query GetProducts {
    products(first: $first, last: $last, before: $before, after: $after) {
      nodes {
        id
        title
        description
        media(first: 1) {
          edges {
            node {
              ... on MediaImage {
                image {
                  id
                  url
                }
              }
            }
          }
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }`,
    {
      variables: queryOption,
    },
  );
  const json = await response.json();
  return json.data;
}
