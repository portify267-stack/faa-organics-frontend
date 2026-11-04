import React from 'react';
import Modal from './Modal';

export default function ProductIngredientsModal({ isOpen, onClose, product }) {
  if (!product) return null;

  // Format array or multi-line strings cleanly
  const formatList = (content) => {
    if (!content) return ['Not specified'];
    if (Array.isArray(content)) return content;
    return String(content)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const keyIngredientsList = formatList(product.keyIngredients);
  const benefitsList = formatList(product.benefits);
  const howToUseList = formatList(product.howToUse);
  const suitabilityText = product.suitability || 'Suitable for all skin types.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ingredients & Details: ${product.name}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* 1. Key Ingredients */}
        <div className="p-4 rounded-xl bg-[#FAF6F0] border border-stone-200">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#3a4d39]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              1. Key Ingredients
            </h4>
          </div>
          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-4">
            {keyIngredientsList.length === 1 && !keyIngredientsList[0].includes(',') ? (
              <p>{keyIngredientsList[0]}</p>
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {keyIngredientsList.map((item, idx) => (
                  <li key={idx} className="text-stone-800 font-medium">
                    {item.replace(/^[•\-\*]\s*/, '')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 2. All Benefits */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#b08968]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              2. All Benefits
            </h4>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-stone-700 leading-relaxed pl-4">
            {benefitsList.map((benefit, idx) => (
              <li key={idx} className="text-stone-800">
                {benefit.replace(/^[•\-\*]\s*/, '')}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. How to Use */}
        <div className="p-4 rounded-xl bg-[#FAF6F0] border border-stone-200">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#8a9b7c]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              3. How to Use
            </h4>
          </div>
          <div className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-4">
            {howToUseList.length > 1 ? (
              <ol className="list-decimal list-inside space-y-1.5">
                {howToUseList.map((step, idx) => (
                  <li key={idx} className="text-stone-800">
                    {step.replace(/^\d+[\.\)]\s*/, '')}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="whitespace-pre-line text-stone-800">{howToUseList[0]}</p>
            )}
          </div>
        </div>

        {/* 4. Suitability */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-[#3a4d39]" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
              4. Suitability
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed pl-4">
            {suitabilityText}
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#3a4d39] text-white text-xs sm:text-sm font-medium hover:bg-[#2d3d2c] transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}

