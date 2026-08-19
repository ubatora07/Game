import { ModalInstance, modalManager } from '../components/ModalManager';
import { marketSystem } from '../../systems/MarketSystem';
import { getMarketOfferDef } from '../../content/marketCatalog';
import { karmaSystem } from '../../systems/KarmaSystem';
import { store } from '../../core/GameState';
import { MarketCategory } from '../../core/market/MarketTypes';
import { t } from '../../services/i18n/I18nService';

function marketBlockReason(reason?: string): string {
  switch (reason) {
    case 'Out of stock': return t('market.reason.out_of_stock');
    case 'Black Market route locked': return t('market.reason.black_market_locked');
    case 'Insufficient Gold': return t('market.reason.insufficient_gold');
    case 'Insufficient Crystals': return t('market.reason.insufficient_crystals');
    default: return t('market.reason.unavailable');
  }
}

export const MarketModal: ModalInstance = {
  id: 'market_modal',
  render: () => {
    let currentCategory: MarketCategory = 'all';
    let selectedOfferId: string | null = null;

    const el = document.createElement('div');
    el.className = 'market-modal-container pixel-fantasy-modal';
    el.style.cssText = 'max-width:580px; padding:16px; background:radial-gradient(ellipse at 50% 15%, #1c1917 0%, #0c0a09 100%); border:2px solid #f59e0b; border-radius:6px; box-shadow:0 0 35px rgba(0,0,0,0.9), inset 0 0 20px rgba(245,158,11,0.15);';

    const refresh = () => {
      const isBlackMarketAvailable = marketSystem.isBlackMarketAvailable();
      const offers = marketSystem.getOffers(currentCategory);
      const selectedOffer = selectedOfferId ? getMarketOfferDef(selectedOfferId) : (offers[0] || null);
      if (selectedOffer) selectedOfferId = selectedOffer.id;

      const canBuy = selectedOffer ? marketSystem.canBuyOffer(selectedOffer.id) : { canBuy: false };
      const currentStock = selectedOffer ? marketSystem.getAvailableStock(selectedOffer.id) : 0;
      const karmaScore = karmaSystem.getScore();

      el.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1.5px solid #78350f; padding-bottom:8px; flex-wrap:wrap; gap:8px;">
          <div>
            <div style="font-size:9px; color:#f59e0b; font-weight:bold; letter-spacing:0.5px; font-family:var(--font-display);">
              ✦ ${t('market.bazaar_label')} ✦
            </div>
            <h3 style="font-family:var(--font-display); font-size:17px; color:#fef08a; margin:1px 0 0 0;">
              ${currentCategory === 'black_market' ? `💀 ${t('market.black_market_title')}` : t('market.caravan_title')}
            </h3>
          </div>

          <!-- Currency Pills -->
          <div style="display:flex; gap:6px; font-size:11px;">
            <span style="background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:4px; border:1px solid #eab308; color:#fef08a;">
              🪙 <b>${store.get().gold}</b>
            </span>
            <span style="background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:4px; border:1px solid ${karmaScore < 0 ? '#f43f5e' : '#34d399'}; color:${karmaScore < 0 ? '#f43f5e' : '#34d399'}; font-weight:bold;">
              ${t('market.karma')}: ${karmaScore >= 0 ? '+' : ''}${karmaScore}
            </span>
          </div>
        </div>

        <!-- Category Tabs -->
        <div style="display:flex; gap:4px; margin-bottom:10px; flex-wrap:wrap;">
          ${(['all', 'materials', 'settlement', 'equipment', 'mercenaries', 'titles'] as MarketCategory[])
            .map(
              (cat) => `
            <button class="btn-market-cat" data-category="${cat}" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === cat ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(0,0,0,0.5)'}; border:1px solid ${currentCategory === cat ? '#f59e0b' : '#78350f'}; border-radius:3px; color:#ffffff; cursor:pointer;">
              ${t(`market.category.${cat}`)}
            </button>
          `
            )
            .join('')}

          ${
            isBlackMarketAvailable
              ? `
            <button class="btn-market-cat" data-category="black_market" style="padding:4px 8px; font-size:10px; font-weight:bold; font-family:var(--font-display); background:${currentCategory === 'black_market' ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'rgba(46,16,101,0.5)'}; border:1px solid #a855f7; border-radius:3px; color:#e9d5ff; cursor:pointer; box-shadow:0 0 8px rgba(168,85,247,0.4);">
              💀 ${t('market.category.black_market')}
            </button>
          `
              : ''
          }
        </div>

        <!-- Offers Grid (Left) + Purchase Inspection (Right) -->
        <div style="display:grid; grid-template-columns: 1fr 1.1fr; gap:10px; margin-bottom:12px;">
          <!-- Offers List -->
          <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto; padding-right:4px;">
            ${
              offers.length > 0
                ? offers
                    .map((o) => {
                      const isSel = o.id === selectedOfferId;
                      const stock = marketSystem.getAvailableStock(o.id);
                      return `
                  <div class="market-offer-card" data-offer-id="${o.id}" style="background:${isSel ? (o.isBlackMarket ? 'rgba(124,58,237,0.25)' : 'rgba(217,119,6,0.25)') : 'rgba(12,10,9,0.7)'}; border:1.5px solid ${isSel ? (o.isBlackMarket ? '#a855f7' : '#f59e0b') : (o.isBlackMarket ? '#6b21a8' : '#78350f')}; border-radius:4px; padding:6px 8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between; transition:all 0.15s ease;">
                    <div style="display:flex; align-items:center; gap:6px; overflow:hidden;">
                      <div style="width:24px; height:24px; flex-shrink:0;">${o.iconSvg}</div>
                      <div style="overflow:hidden;">
                        <div style="font-size:10px; font-weight:bold; color:${o.isBlackMarket ? '#f472b6' : '#fef08a'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t(o.nameKey)}</div>
                        <div style="font-size:8px; color:#38bdf8;">${t('market.stock', { current: stock, max: o.stockMax })}</div>
                      </div>
                    </div>
                    <div style="font-size:9px; font-weight:bold; color:#fde047;">🪙 ${o.price.gold || 0}</div>
                  </div>
                `;
                    })
                    .join('')
                : `<div style="color:#94a3b8; font-size:11px; text-align:center; padding:20px;">${t('market.no_items')}</div>`
            }
          </div>

          <!-- Purchase Details Panel -->
          ${
            selectedOffer
              ? `
            <div style="background:${selectedOffer.isBlackMarket ? 'rgba(30,12,50,0.9)' : 'rgba(28,25,23,0.9)'}; border:1.5px solid ${selectedOffer.isBlackMarket ? '#a855f7' : '#b45309'}; border-radius:4px; padding:10px; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                  <div style="width:34px; height:34px; border-radius:4px; background:#0c0a09; border:1px solid ${selectedOffer.isBlackMarket ? '#a855f7' : '#f59e0b'}; display:flex; align-items:center; justify-content:center;">
                    ${selectedOffer.iconSvg}
                  </div>
                  <div>
                    <div style="font-size:12px; font-weight:bold; color:#fef08a; font-family:var(--font-display);">${t(selectedOffer.nameKey)}</div>
                    <div style="font-size:9px; color:${selectedOffer.isBlackMarket ? '#f43f5e' : '#38bdf8'}; font-weight:bold;">${t('market.rarity_stock', { rarity: t(`equipment.rarity.${selectedOffer.rarity}`), stock: currentStock })}</div>
                  </div>
                </div>

                <p style="font-size:10px; color:#cbd5e1; margin:0 0 8px 0; line-height:1.3;">
                  ${t(selectedOffer.descKey)}
                </p>

                ${
                  selectedOffer.tradeOffDesc
                    ? `
                  <div style="background:rgba(244,63,94,0.15); border:1px solid #f43f5e; border-radius:3px; padding:6px; font-size:9px; color:#fca5a5; margin-bottom:8px; font-weight:bold;">
                    ⚠️ ${t('market.tradeoff_label')}:<br/>
                    ${selectedOffer.tradeOffKey ? t(selectedOffer.tradeOffKey) : selectedOffer.tradeOffDesc}
                  </div>
                `
                    : ''
                }

                <div style="background:rgba(0,0,0,0.4); padding:6px; border-radius:3px; font-size:10px; margin-bottom:8px;">
                  <div style="color:#f59e0b; font-weight:bold; font-size:9px;">${t('market.price')}:</div>
                  <div>🪙 ${t('currency.gold')}: <b>${selectedOffer.price.gold || 0}</b></div>
                  ${selectedOffer.price.karmaCost ? `<div style="color:#f43f5e;">⚡ ${t('market.karma_shift')}: <b>${selectedOffer.price.karmaCost} ${t('market.karma')}</b></div>` : ''}
                </div>
              </div>

              <button id="btn-buy-offer" ${!canBuy.canBuy ? 'disabled' : ''} style="width:100%; padding:8px; background:${canBuy.canBuy ? (selectedOffer.isBlackMarket ? 'linear-gradient(135deg, #7c3aed, #4c1d95)' : 'linear-gradient(135deg, #10b981, #059669)') : '#292524'}; border:1px solid ${canBuy.canBuy ? (selectedOffer.isBlackMarket ? '#a855f7' : '#34d399') : '#451a03'}; border-radius:4px; color:${canBuy.canBuy ? '#ffffff' : '#78716c'}; font-family:var(--font-display); font-weight:bold; font-size:12px; cursor:${canBuy.canBuy ? 'pointer' : 'not-allowed'}; box-shadow:${canBuy.canBuy ? '0 0 10px rgba(16,185,129,0.4)' : 'none'};">
                ${canBuy.canBuy ? `✦ ${t('market.purchase_for', { gold: selectedOffer.price.gold || 0 })} ✦` : t('market.blocked_reason', { reason: marketBlockReason(canBuy.reason) })}
              </button>
            </div>
          `
              : `<div style="color:#94a3b8; font-size:11px;">${t('market.select_offer')}</div>`
          }
        </div>

        <!-- Footer Actions -->
        <div style="display:flex; gap:6px;">
          <button id="btn-refresh-market" style="padding:6px 12px; background:#451a03; border:1px solid #78350f; border-radius:4px; color:#fde047; font-family:var(--font-display); font-size:11px; font-weight:bold; cursor:pointer;">
            🔄 ${t('market.refresh_stock')}
          </button>
          <button id="btn-close-market" style="flex:1; padding:6px; background:#1c1917; border:1px solid #78350f; border-radius:4px; color:#cbd5e1; font-family:var(--font-display); font-size:11px; cursor:pointer;">
            ${t('market.exit')}
          </button>
        </div>
      `;

      // Event listeners
      el.querySelectorAll('.btn-market-cat').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentCategory = btn.getAttribute('data-category') as MarketCategory;
          const firstOffer = marketSystem.getOffers(currentCategory)[0];
          if (firstOffer) selectedOfferId = firstOffer.id;
          refresh();
        });
      });

      el.querySelectorAll('.market-offer-card').forEach((card) => {
        card.addEventListener('click', () => {
          selectedOfferId = card.getAttribute('data-offer-id');
          refresh();
        });
      });

      el.querySelector('#btn-buy-offer')?.addEventListener('click', () => {
        if (selectedOfferId) {
          const res = marketSystem.buyOffer(selectedOfferId);
          if (res.success) {
            refresh();
          }
        }
      });

      el.querySelector('#btn-refresh-market')?.addEventListener('click', () => {
        marketSystem.refreshStock();
        refresh();
      });

      el.querySelector('#btn-close-market')?.addEventListener('click', () => {
        modalManager.close('market_modal');
      });
    };

    refresh();
    return el;
  },
};
