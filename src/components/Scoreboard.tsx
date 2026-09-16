'use client';

import { ArrowRight } from 'lucide-react';

interface ScoreboardProps {
  prokerCount: number;
  agendaCount: number;
  memberCount: number;
}

export default function Scoreboard({ prokerCount, agendaCount, memberCount }: ScoreboardProps) {
  const pad = (num: number) => num.toString().padStart(2, '0');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="scoreboard" id="scoreboard" aria-label="Ringkasan Kementerian Minat dan Bakat">
      <button className="score-tile" onClick={() => scrollTo('proker')}>
        <span className="score-label">Program Kerja</span>
        <div className="flap-num">
          <div className="flap-digit">
            <span className="flap-face">{pad(prokerCount)[0]}</span>
          </div>
          <div className="flap-digit">
            <span className="flap-face">{pad(prokerCount)[1]}</span>
          </div>
        </div>
        <span className="score-cta">
          Lihat program <ArrowRight size={14} />
        </span>
      </button>

      <button className="score-tile" onClick={() => scrollTo('proker')}>
        <span className="score-label">Agenda Kerja</span>
        <div className="flap-num">
          <div className="flap-digit">
            <span className="flap-face">{pad(agendaCount)[0]}</span>
          </div>
          <div className="flap-digit">
            <span className="flap-face">{pad(agendaCount)[1]}</span>
          </div>
        </div>
        <span className="score-cta">
          Lihat agenda <ArrowRight size={14} />
        </span>
      </button>

      <button className="score-tile" onClick={() => scrollTo('profil')}>
        <span className="score-label">Anggota Pengurus</span>
        <div className="flap-num">
          <div className="flap-digit">
            <span className="flap-face">{pad(memberCount)[0]}</span>
          </div>
          <div className="flap-digit">
            <span className="flap-face">{pad(memberCount)[1]}</span>
          </div>
        </div>
        <span className="score-cta">
          Lihat profil <ArrowRight size={14} />
        </span>
      </button>
    </div>
  );
}
