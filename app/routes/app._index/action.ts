import { AdminApiContext } from "@shopify/shopify-app-react-router/server";
import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "@/shopify.server";
import {
  getEbayToken,
  getItemsByItemGroup,
  getItemsByLegacyId,
} from "@/services/ebay";
import { getItemIdFromUrl, getKeysBetweenKeys } from "@/libs/format";
import {
  actions,
  endKeyToGetVariant,
  startKeyToGetVariant,
} from "@/contants/app";
import { Item } from "@/types/item";
import { ProductMediaRequest, ProductRequest } from "@/types/product";
import {
  appendMediaToProductVariant,
  createProduct,
  createProductMedia,
  createProductVariants,
  getListProductVariants,
  getProductById,
  updateProductVariants,
} from "@/services/shopify";
import { saveProduct } from "@/services/product.prisma";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const action = formData.get("action") as string;

  if (action === actions.getProductDetail) {
    const productUrl = formData.get("productUrl") as string;
    const items = await getItemDetail(productUrl);
    return { items, action };
  }

  if (action === actions.syncProduct) {
    const stringifyItems = formData.get("items") as string;
    const items = JSON.parse(stringifyItems) as Item[];
    const stringifyProduct = formData.get("product") as string;
    const product = JSON.parse(stringifyProduct) as ProductRequest;

    const newProduct = await syncProduct(admin, { items, product });
    await saveProduct(session.shop, newProduct);

    return { action, items: null };
  }
};

async function getItemDetail(productUrl: string) {
  const itemId = getItemIdFromUrl(productUrl);

  const token = await getEbayToken();
  let items = await getItemsByLegacyId(itemId, token);
  if (items) return items;

  items = await getItemsByItemGroup(itemId, token);
  return items;
}

async function syncProduct(
  admin: AdminApiContext,
  data: { items: Item[]; product: ProductRequest },
) {
  const { items, product } = data;

  product.productOptions = product.productOptions.map((option) => ({
    ...option,
    values: Array.from(new Set(option.values.map((value) => value.name))).map(
      (value) => ({ name: value }),
    ),
  }));
  const createdProductResponse = await createProduct(admin, product);
  const createdProduct = createdProductResponse.productCreate.product;

  const media: ProductMediaRequest[] = items.map((item) => ({
    alt: item.title,
    mediaContentType: "IMAGE",
    originalSource: item.image.imageUrl,
  }));
  const mediaResponse = await createProductMedia(
    admin,
    createdProduct.id,
    media,
  );
  const mediaIds = mediaResponse.productCreateMedia.media.map(
    (media) => media.id,
  );

  const newProductResponse = await getProductById(
    admin,
    createdProduct.id,
    media.length,
  );
  const newProduct = newProductResponse.product;

  const options = newProduct.options;
  const productOptionKeys = getKeysBetweenKeys(
    items[0],
    startKeyToGetVariant,
    endKeyToGetVariant,
  );
  const variants = items.map((item, index) => ({
    price: item.price.value,
    optionValues: productOptionKeys.map((key) => {
      const option = options.find(
        (option) => option.name.toLowerCase() === key.toLowerCase(),
      );
      return {
        name: items[index][key],
        optionId: option?.id || "",
      };
    }),
  }));
  await createProductVariants(admin, {
    productId: newProduct.id,
    variants: variants.slice(1),
  });

  const idParts = newProduct.id.split("/");
  const idNumber = idParts[idParts.length - 1];
  const listVariantResponse = await getListProductVariants(
    admin,
    idNumber,
    variants.length,
  );
  const listVariant = listVariantResponse.productVariants.nodes;
  await updateProductVariants(admin, {
    productId: newProduct.id,
    variants: [{ ...variants[0], id: listVariant[0].id }],
  });

  await appendMediaToProductVariant(admin, {
    productId: newProduct.id,
    variantMedia: listVariant.map((variant, index) => ({
      variantId: variant.id,
      mediaIds: [mediaIds[index]],
    })),
  });

  return { ...newProduct, image: items[0].image.imageUrl };
}
