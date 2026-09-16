'use client';

import { useState } from 'react';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { ProkerItem } from '@/lib/initialData';

interface AccordionProkerProps {
  items: ProkerItem[];
}

export default function AccordionProker({ items }: AccordionProkerProps) {
  const [activeTab, setActiveTab] = useState<'proker' | 'agenda'>('proker');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'proker-1': true,
    'agenda-1': true,
  });

  const prokers = items.filter((i) => i.kategori === 'proker');
  const agendas = items.filter((i) => i.kategori === 'agenda');

  const currentList = activeTab === 'proker' ? prokers : agendas;

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    const allOpen = currentList.every((item) => openItems[item.id]);
    const nextState = { ...openItems };
    currentList.forEach((item) => {
      nextState[item.id] = !allOpen;
    });
    setOpenItems(nextState);
  };

  const isAllOpen = currentList.length > 0 && currentList.every((item) => openItems[item.id]);

  return (
    <div>
      <div className="tab-bar">
        <div className="tab-switch" role="tablist" aria-label="Jenis kegiatan">
          <button
            role="tab"
            aria-selected={activeTab === 'proker'}
            className={`tab-btn ${activeTab === 'proker' ? 'active' : ''}`}
            onClick={() => setActiveTab('proker')}
          >
            Program Kerja<span className="cnt">{prokers.length.toString().padStart(2, '0')}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'agenda'}
            className={`tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
            onClick={() => setActiveTab('agenda')}
          >
            Agenda Kerja<span className="cnt">{agendas.length.toString().padStart(2, '0')}</span>
          </button>
        </div>

        <button className="acc-toggle-all" onClick={toggleAll} aria-label={isAllOpen ? 'Tutup semua kegiatan' : 'Buka semua kegiatan'}>
          <ChevronsUpDown size={15} />
          <span>{isAllOpen ? 'Tutup semua' : 'Buka semua'}</span>
        </button>
      </div>

      <div className="acc">
        {currentList.map((item) => {
          const isOpen = Boolean(openItems[item.id]);
          return (
            <div key={item.id} className={`acc-item ${isOpen ? 'open' : ''}`}>
              <button
                className="acc-summary"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`detail-${item.id}`}
              >
                <div className="acc-head">
                  <span className="acc-code">{item.code}</span>
                  <span className="acc-name">{item.nama}</span>
                  {item.subtitle && <span className="acc-full script">{item.subtitle}</span>}
                </div>
                <span className="acc-plus"><ChevronDown size={18} /></span>
              </button>

              {isOpen && (
                <div className="acc-body" id={`detail-${item.id}`}>
                  <p>{item.deskripsi}</p>
                  {item.chips && item.chips.length > 0 && (
                    <div className="acc-chips">
                      {item.chips.map((chip, idx) => (
                        <span key={idx} className="chip">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
