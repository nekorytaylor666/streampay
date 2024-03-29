import { ClusterExtended } from "@streamflow/stream";

import {
  EVENT_TYPE,
  DEFAULT_GA_PURCHASE_CURRENCY,
  AFFILIATION,
  DATA_LAYER_VARIABLE,
} from "../constants";

declare global {
  interface Window {
    dataLayer: any;
  }
}

declare global {
  interface document {
    location: Location;
    title: any;
  }
}

export function trackPageView(cluster: ClusterExtended) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.PAGEVIEW,
    page: {
      url: document.location.pathname,
      title: document.title,
    },
    cluster,
  });
}

export function trackEvent(
  category: string,
  action: string,
  label: string,
  value: number,
  additionalDataLayerVariables: object = {}
) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.EVENT,
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
    ...additionalDataLayerVariables,
  });
}

export function trackTransaction(
  streamAddress: string,
  tokenSymbol: string,
  tokenName: string,
  tokenPriceUsd: number,
  variant: string,
  streamflowFeeUsd: number,
  streamflowFeeToken: number,
  totalAmountToken: number,
  totalAmountUsd: number,
  walletType: string | undefined
) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.PURCHASE,
    products: JSON.stringify([
      {
        id: tokenSymbol,
        title: tokenName,
        price: tokenPriceUsd,
        quantity: Math.round(totalAmountToken),
        variant,
      },
    ]),
    purchaseDetails: JSON.stringify({
      id: streamAddress,
      revenue: streamflowFeeUsd,
      affiliation: AFFILIATION.APP,
      currency: DEFAULT_GA_PURCHASE_CURRENCY,
    }),
    [DATA_LAYER_VARIABLE.STREAM_ADDRESS]: streamAddress,
    [DATA_LAYER_VARIABLE.STREAMFLOW_FEE_USD]: streamflowFeeUsd,
    [DATA_LAYER_VARIABLE.STREAMFLOW_FEE_TOKEN]: streamflowFeeToken,
    [DATA_LAYER_VARIABLE.TOTAL_AMOUNT_TOKEN]: totalAmountToken,
    [DATA_LAYER_VARIABLE.TOTAL_AMOUNT_USD]: totalAmountUsd,
    [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType,
  });
}
