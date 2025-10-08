import { useEffect, useState } from "react";
import type { HeadersFunction } from "react-router";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { loader } from "./loader";
import { action } from "./action";
import {
  actions,
  endKeyToGetVariant,
  startKeyToGetVariant,
} from "@/contants/app";
import { ProductOption, ProductRequest } from "@/types/product";
import { capitalizeFirstLetter, getKeysBetweenKeys } from "@/libs/format";

export { loader };
export { action };

export default function Index() {
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [productUrl, setProductUrl] = useState("");

  const isLoading = ["loading", "submitting"].includes(fetcher.state);
  const data = fetcher.data;

  const productOptionKeys = data?.items
    ? getKeysBetweenKeys(
        data.items[0],
        startKeyToGetVariant,
        endKeyToGetVariant,
      )
    : [];
  const product: ProductRequest | null = data?.items
    ? {
        title: data.items[0].title,
        descriptionHtml: data.items[0].shortDescription,
        productOptions: data.items.reduce<ProductOption>(
          (currentOptions, item, index) => {
            if (index === 0) {
              const options: ProductOption = productOptionKeys.map(
                (option) => ({
                  name: option,
                  values: [{ name: item[option] }],
                }),
              );
              return options;
            }

            productOptionKeys.forEach((option, index) => {
              currentOptions[index].values.push({ name: item[option] });
            });
            return currentOptions;
          },
          [],
        ),
      }
    : null;

  useEffect(() => {
    if (!data?.action) return;
    if (!isLoading && data.action === actions.syncProduct && !data.items) {
      shopify.toast.show("Product synced successfully!");
    }
  }, [data, isLoading, shopify]);

  const fetchItemDetail = () => {
    fetcher.submit(
      { productUrl, action: actions.getProductDetail },
      { method: "POST" },
    );
  };

  const syncProduct = () => {
    if (!data?.items) {
      shopify.toast.show("Items are not valid!");
      return;
    }

    fetcher.submit(
      {
        items: JSON.stringify(data.items),
        product: JSON.stringify(product),
        action: actions.syncProduct,
      },
      { method: "POST" },
    );

    setProductUrl("");
  };

  return (
    <s-page heading="Cross-Site Product Sync">
      <s-section heading="Welcome to Product Sync 🎉">
        <s-paragraph>
          This tool helps you quickly import products from eBay into your
          Shopify store. Just paste eBay product URLs below, and we’ll fetch
          product details, map them into Shopify format, and create or update
          products in your store automatically.
        </s-paragraph>
      </s-section>
      <s-section heading="How it works">
        <s-unordered-list>
          <s-list-item>
            Paste an eBay product URL into the form below.
          </s-list-item>
          <s-list-item>
            We’ll fetch product details, images, and pricing, then convert them
            into Shopify format.
          </s-list-item>
          <s-list-item>
            Your products will be created or updated in your Shopify store
            automatically.
          </s-list-item>
        </s-unordered-list>
      </s-section>
      <s-section>
        <s-text-field
          label="Product URL"
          placeholder="Please enter an eBay product URL"
          value={productUrl}
          onChange={(e) => setProductUrl(e.currentTarget.value)}
        ></s-text-field>
        <s-button onClick={fetchItemDetail} disabled={isLoading}>
          Preview product information
        </s-button>
      </s-section>
      {product && (
        <s-section>
          <s-box paddingBlockEnd="small">
            <s-text type="strong">Title: </s-text>
            <s-text>{product.title}</s-text>
          </s-box>
          <s-box paddingBlock="small">
            <s-text type="strong">Description: </s-text>
            <s-text>{product.descriptionHtml}</s-text>
          </s-box>
          <s-box paddingBlock="small">
            <s-text type="strong">Variants: </s-text>
          </s-box>
          <s-ordered-list>
            {data?.items?.map((item) => (
              <s-list-item key={item.itemId}>
                {productOptionKeys.map((option) => (
                  <s-box key={option}>
                    <s-text type="strong">
                      {capitalizeFirstLetter(option)}:{" "}
                    </s-text>
                    <s-text>{item[option]}</s-text>
                  </s-box>
                ))}
                <s-box>
                  <s-text type="strong">Price: </s-text>
                  <s-text>{item.price.value}</s-text>
                </s-box>
                <s-box>
                  <s-text type="strong">Image: </s-text>
                  <s-text>{item.image.imageUrl}</s-text>
                </s-box>
              </s-list-item>
            ))}
          </s-ordered-list>
          <s-grid paddingBlockStart="small" justifyContent="center">
            <s-button onClick={syncProduct} disabled={isLoading}>
              Sync product
            </s-button>
          </s-grid>
        </s-section>
      )}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
