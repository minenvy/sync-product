import db from "@/db.server";
import { ProductWithMainImage } from "@/types/product";

export async function saveProduct(shop: string, product: ProductWithMainImage) {
  await db.product.create({
    data: {
      id: product.id,
      shop,
      title: product.title,
      image: product.image,
    },
  });
}
