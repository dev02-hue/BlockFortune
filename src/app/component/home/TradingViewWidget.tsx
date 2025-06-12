"use client";
import React, { useEffect } from 'react';

interface TradingViewWidgetProps {
  widgetType: 'symbol-overview' | 'technical-analysis' | 'ticker' | 'market-overview';
  theme: 'light' | 'dark';
  symbols?: string[][];
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ widgetType, theme, symbols }) => {
  useEffect(() => {
    // Load TradingView script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "BITSTAMP:BTCUSD",
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      toolbar_bg: "#f1f3f6",
      enable_publishing: false,
      hide_top_toolbar: true,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      container_id: "tradingview-widget-container"
    });

    const container = document.getElementById('tradingview-widget-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [widgetType, theme, symbols]);

  return (
    <div 
      id="tradingview-widget-container"
      className="tradingview-widget-container w-full h-full"
    >
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default TradingViewWidget;