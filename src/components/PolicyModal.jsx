import React from 'react';
import { useCart } from '../context/CartContext';
import { policies } from '../data/policies';

export default function PolicyModal() {
  const { activePolicy, closePolicy } = useCart();

  if (!activePolicy || !policies[activePolicy]) return null;

  const policy = policies[activePolicy];

  return (
    <>
      <div className="policy-modal-overlay active" id="policy-overlay" onClick={closePolicy} aria-hidden="false"></div>
      <div className="policy-modal active" id="policy-modal" role="dialog" aria-modal="true" aria-label="Policy content">
        <button type="button" className="policy-close-btn" id="policy-close" aria-label="Close policy modal" onClick={closePolicy}>
          &times;
        </button>
        <h3 id="policy-title">{policy.title}</h3>
        <div
          className="policy-content-body"
          id="policy-content"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        ></div>
      </div>
    </>
  );
}

