import React, { useState } from 'react';
import { LiquidTabs } from '../components/LiquidTabs';
import { useApp } from '../AppContext';
import { getCurrencySymbol } from '../lib/format-utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Inventory = () => {
  const { data, inventoryCategories, addInventoryCategory, getStockStatus, openModal, deleteStockItem, duplicateStockItem, openConfirm, openPrompt } = useApp();
  const currencySymbol = getCurrencySymbol(data.settings.currency || 'PHP');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const handleCreatePO = () => {
    const doc = new jsPDF();
    const lowStockItems = data.ingredients.filter(item => (item.stockQty || 0) <= (item.minStock || 0));

    if (lowStockItems.length === 0) {
      alert("No low stock items to order.");
      return;
    }

    doc.setFontSize(18);
    doc.text("Purchase Order - Low Stock Items", 14, 22);
    doc.setFontSize(11);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = lowStockItems.map(item => [
      item.name,
      `${item.stockQty} ${item.unit}`,
      item.minStock ? `${item.minStock} ${item.unit}` : '-',
      `${currencySymbol}${item.cost.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Item Name', 'Current Stock', 'Min Stock', 'Unit Cost']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [48, 48, 48] }
    });

    doc.save(`Purchase_Order_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredIngredients = activeCategory === 'All Items'
    ? data.ingredients
    : data.ingredients.filter(i => i.category === activeCategory);

  return (
    <div id="view-inventory" className="flex flex-col h-full overflow-hidden animate-fade-in text-[#303030] dark:text-white pb-4 space-y-6">

      {/* Low Stock Banner (Dark) */}
      <div className="soft-card-dark p-6 flex flex-col md:flex-row items-center justify-between shrink-0">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-full bg-[#FCD34D] text-[#303030] flex items-center justify-center font-bold text-xl shrink-0">
            !
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Low Stock Warning</h3>
            <p className="text-sm text-gray-400">Items below safety levels need reordering.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal('stock')}
            className="bg-[#FCD34D] text-[#303030] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-[#fbbf24] transition shadow-sm whitespace-nowrap flex items-center gap-2"
          >
            <iconify-icon icon="lucide:plus" width="16"></iconify-icon>
            Add New Item
          </button>
          <button
            onClick={handleCreatePO}
            className="bg-white text-[#303030] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition shadow-sm whitespace-nowrap"
          >
            Create PO
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 soft-card min-h-0 flex-1 overflow-hidden dark:bg-[#1A1A1A] dark:border-[#27272A]">

        {/* Categories Sidebar */}
        <div className="w-full lg:w-48 shrink-0 p-6 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-[#333] bg-gray-50/50 dark:bg-white/5">
          <div className="flex justify-between items-center mb-4 px-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CATEGORIES</p>
            <button
              onClick={() => {
                openPrompt("New Category Name:", "", (val) => addInventoryCategory(val));
              }}
              className="text-gray-400 hover:text-[#303030] transition-colors"
              title="Add Category"
            >
              <iconify-icon icon="lucide:plus-circle" width="14"></iconify-icon>
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <LiquidTabs
              tabs={inventoryCategories.map(cat => ({ id: cat, label: cat }))}
              activeId={activeCategory}
              onChange={(id) => id && setActiveCategory(id)}
              className="bg-transparent p-0 border-none"
              orientation="vertical"
              layoutId="inventory-cats"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-100 dark:border-[#333] shrink-0">
            <h2 className="text-xl font-light tracking-tight text-[#303030] dark:text-white">{activeCategory} ( {filteredIngredients.length} )</h2>
            <div className="relative w-full md:w-64 mt-4 md:mt-0">
              <iconify-icon icon="lucide:search" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" width="16"></iconify-icon>
              <input
                type="text"
                placeholder="Search item..."
                className="soft-input dark:bg-[#2A2A2A] dark:border-[#333] dark:text-white rounded-full pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white dark:bg-[#1A1A1A] z-10 shadow-sm">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200 dark:border-[#333]">
                  <th className="py-4 pl-8 bg-white dark:bg-[#1A1A1A]">Item Name</th>
                  <th className="py-4 bg-white dark:bg-[#1A1A1A]">Category</th>
                  <th className="py-4 bg-white dark:bg-[#1A1A1A]">Status</th>
                  <th className="py-4 w-1/4 bg-white dark:bg-[#1A1A1A]">Quantity</th>
                  <th className="py-4 bg-white dark:bg-[#1A1A1A]">Unit Cost</th>
                  <th className="py-4 text-right bg-white dark:bg-[#1A1A1A]">Total Value</th>
                  <th className="py-4 text-center pr-8 bg-white dark:bg-[#1A1A1A]">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredIngredients.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No items in this category.</td></tr>
                ) : (
                  filteredIngredients.map(item => {
                    const status = getStockStatus(item);
                    const totalValue = (item.stockQty || 0) * item.cost;
                    const maxStock = (item.minStock || 1) * 3;
                    const isMenuOpen = activeMenuId === item.id;

                    return (
                      <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-200 dark:border-[#333] last:border-0 cursor-default">
                        <td className="py-4 pl-8 font-bold text-[#303030] dark:text-white">{item.name}</td>
                        <td className="py-4">
                          {item.category && <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase">{item.category}</span>}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${status.bgClass}`}></span>
                            <span className={`text-xs font-bold ${status.textClass}`}>{status.label}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3 pr-8">
                            <span className="text-xs font-bold text-[#303030] dark:text-white w-16 text-right">{item.stockQty} {item.unit}</span>
                            <div className="h-1.5 flex-1 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${status.bgClass}`}
                                style={{ width: `${Math.min(100, ((item.stockQty || 0) / maxStock) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 font-medium text-gray-500 dark:text-gray-400">{currencySymbol}{item.cost.toFixed(2)}/{item.unit}</td>
                        <td className="py-4 text-right font-bold text-[#303030] dark:text-white">{currencySymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="py-4 text-center pr-8 relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : item.id);
                            }}
                            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isMenuOpen ? 'bg-gray-200 dark:bg-[#3F3F46] text-[#303030] dark:text-white' : 'text-gray-300 hover:text-[#303030] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3F3F46]'}`}
                          >
                            <iconify-icon icon="lucide:more-horizontal" width="16"></iconify-icon>
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-8 top-8 z-20 w-32 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#333] rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-200 flex flex-col text-left overflow-hidden">
                              <button
                                onClick={() => { setActiveMenuId(null); openModal('stock', item); }}
                                className="px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center gap-2 transition-colors w-full text-left"
                              >
                                <iconify-icon icon="lucide:edit-2" width="14"></iconify-icon>
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openConfirm("Duplicate Item", `Are you sure you want to duplicate ${item.name}?`, () => duplicateStockItem(item.id));
                                }}
                                className="px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] flex items-center gap-2 transition-colors w-full text-left"
                              >
                                <iconify-icon icon="lucide:copy" width="14"></iconify-icon>
                                Clone
                              </button>
                              <div className="h-px bg-gray-50 my-1"></div>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  openConfirm("Delete Item", `Are you sure you want to delete ${item.name}? This cannot be undone.`, () => deleteStockItem(item.id), true);
                                }}
                                className="px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors w-full text-left"
                              >
                                <iconify-icon icon="lucide:trash-2" width="14"></iconify-icon>
                                Delete
                              </button>
                            </div>
                          )}
                          {/* Backdrop to close */}
                          {isMenuOpen && (
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 dark:border-[#333] flex justify-between items-center shrink-0 bg-white dark:bg-[#1A1A1A] rounded-br-xl">
            <span className="text-xs text-gray-400">Showing <strong>1-{Math.min(10, filteredIngredients.length)}</strong> of <strong>{filteredIngredients.length}</strong> items</span>
          </div>
        </div>
      </div>
    </div>
  );
};
