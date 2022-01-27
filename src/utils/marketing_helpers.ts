import { EVENT_TYPE, STREAMFLOW_WEB_AFFILIATION, DEFAULT_PURCHASE_CURRENCY } from "../constants";

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

export function trackPageView() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.PAGEVIEW,
    page: {
      url: document.location.pathname,
      title: document.title,
    },
  });
}

export function trackEvent(category: string, action: string, label: string, value: number) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.EVENT,
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
  });
}

export function trackTransaction(
  streamId: string,
  tokenTicker: string,
  tokenName: string,
  variant: string,
  feeValue: number,
  totalDepositedAmount: number
) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.PURCHASE,
    products: JSON.stringify([
      {
        id: tokenTicker,
        title: tokenName,
        price: feeValue,
        quantity: totalDepositedAmount,
        brand: "v2",
        variant,
      },
    ]),
    purchaseDetails: JSON.stringify({
      id: streamId,
      revenue: feeValue,
      affiliation: STREAMFLOW_WEB_AFFILIATION,
      currency: DEFAULT_PURCHASE_CURRENCY,
    }),
    streamId: streamId,
    revenue: feeValue,
    totalDepositedAmount,
  });
}
