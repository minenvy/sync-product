import { encodeBase64 } from "../libs/format";
import { Item } from "@/types/item";
import axios from "axios";

export async function getEbayToken() {
  try {
    const authHeader = encodeBase64(
      `${process.env.EBAY_APP_ID}:${process.env.EBAY_CLIENT_SECRET}`,
    );
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("scope", `${process.env.EBAY_BASE_API_URL}/oauth/api_scope`);

    const response = await axios.post(
      `${process.env.EBAY_BASE_API_URL}/identity/v1/oauth2/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authHeader}`,
        },
      },
    );
    return response?.data?.access_token as string;
  } catch {
    return "";
  }
}

export async function getItemsByLegacyId(legacyItemId: string, token: string) {
  try {
    const response = await axios.get(
      `${process.env.EBAY_BASE_API_URL}/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${legacyItemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return [response?.data] as Item[];
  } catch {
    return null;
  }
}

export async function getItemsByItemGroup(itemGroupId: string, token: string) {
  try {
    const response = await axios.get(
      `${process.env.EBAY_BASE_API_URL}/buy/browse/v1/item/get_items_by_item_group?item_group_id=${itemGroupId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response?.data?.items as Item[];
  } catch {
    return null;
  }
}
