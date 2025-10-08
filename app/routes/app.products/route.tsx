import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { authenticate } from "@/shopify.server";
import db from "@/db.server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const products = await db.product.findMany();
  return products ?? [];
};

export default function Product() {
  const products = useLoaderData<typeof loader>();

  return (
    <s-page heading="Products">
      <s-table>
        <s-table-header-row>
          <s-table-header>Title</s-table-header>
          <s-table-header>Image</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {products.map((product) => (
            <s-table-row key={product.id}>
              <s-table-cell>{product.title}</s-table-cell>
              <s-table-cell>
                <img
                  className={styles.imageSmall}
                  src={product.image}
                  alt={product.title}
                ></img>
              </s-table-cell>
            </s-table-row>
          ))}
        </s-table-body>
      </s-table>
    </s-page>
  );
}
