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

export function trackEvent(category: string, action: string, label: string, value: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: EVENT_TYPE.EVENT,
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
    eventValue: value,
  });
}

//Da li feeValue: number podrzava decimale?
export function trackTransaction(
  streamId: string,
  tokenTicker: string,
  tokenName: string,
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
        quantity: 1,
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
