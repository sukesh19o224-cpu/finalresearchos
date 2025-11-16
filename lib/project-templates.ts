export interface ProjectTemplate {
  id: string
  name: string
  description: string
  researchType: string
  icon: string
  defaultStructure: {
    pages: { title: string; content: string }[]
    tags: string[]
  }
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'battery-research',
    name: 'Battery Research',
    description: 'Complete setup for lithium-ion battery degradation and cycling studies',
    researchType: 'Battery Research',
    icon: '🔋',
    defaultStructure: {
      pages: [
        {
          title: 'Project Overview',
          content: '# Battery Research Project\n\n## Objectives\n- [ ] Characterize battery performance\n- [ ] Analyze degradation mechanisms\n- [ ] Optimize cycling protocols\n\n## Methods\n- Galvanostatic cycling\n- EIS measurements\n- Capacity fade analysis',
        },
        {
          title: 'Experimental Protocol',
          content: '# Experimental Protocol\n\n## Battery Cycling\n1. Formation cycles\n2. Capacity testing\n3. Long-term cycling\n\n## EIS Measurements\n- Frequency range: 100kHz - 10mHz\n- Amplitude: 10mV\n- SOC points: 100%, 50%, 10%',
        },
        {
          title: 'Results & Analysis',
          content: '# Results\n\n## Capacity Fade\n[Upload cycling data here]\n\n## EIS Analysis\n[Upload EIS spectra here]\n\n## Conclusions\n[To be completed]',
        },
      ],
      tags: ['Battery', 'Cycling', 'EIS', 'Degradation'],
    },
  },
  {
    id: 'fuel-cell',
    name: 'Fuel Cell Research',
    description: 'Template for PEM fuel cell performance and durability testing',
    researchType: 'Fuel Cells',
    icon: '⚡',
    defaultStructure: {
      pages: [
        {
          title: 'Project Overview',
          content: '# Fuel Cell Research\n\n## Objectives\n- [ ] Characterize MEA performance\n- [ ] Durability testing\n- [ ] Optimize operating conditions\n\n## Cell Specifications\n- Active area:\n- Catalyst loading:\n- Membrane type:',
        },
        {
          title: 'Experimental Protocol',
          content: '# Testing Protocol\n\n## Polarization Curves\n- Temperature:\n- RH:\n- Stoichiometry:\n\n## EIS Measurements\n- Frequency range: 10kHz - 0.1Hz\n- Current densities:\n\n## Durability Protocol\n- Cycling conditions:\n- Duration:',
        },
        {
          title: 'Performance Data',
          content: '# Performance Results\n\n## IV Curves\n[Upload data]\n\n## EIS Analysis\n[Upload spectra]\n\n## Durability Results\n[Track degradation]',
        },
      ],
      tags: ['Fuel Cell', 'PEM', 'Polarization', 'EIS'],
    },
  },
  {
    id: 'corrosion',
    name: 'Corrosion Studies',
    description: 'Setup for electrochemical corrosion analysis and protection studies',
    researchType: 'Corrosion',
    icon: '🛡️',
    defaultStructure: {
      pages: [
        {
          title: 'Project Overview',
          content: '# Corrosion Research\n\n## Objectives\n- [ ] Determine corrosion rate\n- [ ] Evaluate protection methods\n- [ ] Analyze corrosion mechanisms\n\n## Material\n- Type:\n- Composition:\n- Surface preparation:',
        },
        {
          title: 'Experimental Methods',
          content: '# Methods\n\n## Potentiodynamic Polarization\n- Scan rate:\n- Potential range:\n- Electrolyte:\n\n## EIS\n- Frequency range:\n- OCP stabilization time:\n\n## Immersion Tests\n- Duration:\n- Conditions:',
        },
        {
          title: 'Corrosion Analysis',
          content: '# Results\n\n## Tafel Analysis\n[Upload polarization curves]\n\n## EIS Fitting\n[Upload Nyquist plots]\n\n## Corrosion Rate\n[Calculate from data]',
        },
      ],
      tags: ['Corrosion', 'Tafel', 'EIS', 'Protection'],
    },
  },
  {
    id: 'electrocatalysis',
    name: 'Electrocatalysis',
    description: 'Template for catalyst characterization and activity studies',
    researchType: 'Electrocatalysis',
    icon: '⚗️',
    defaultStructure: {
      pages: [
        {
          title: 'Project Overview',
          content: '# Electrocatalysis Research\n\n## Objectives\n- [ ] Synthesize catalyst\n- [ ] Characterize activity\n- [ ] Optimize conditions\n\n## Catalyst Details\n- Composition:\n- Loading:\n- Support:',
        },
        {
          title: 'Electrochemical Testing',
          content: '# Testing Protocol\n\n## Cyclic Voltammetry\n- Scan rate: 50 mV/s\n- Potential window:\n- Electrolyte:\n\n## LSV for Activity\n- Scan rate: 5 mV/s\n- Rotation speed (RDE):\n\n## Stability Testing\n- Cycling protocol:\n- Duration:',
        },
        {
          title: 'Activity Results',
          content: '# Results\n\n## CV Analysis\n[Upload CV curves]\n\n## Activity Metrics\n- Onset potential:\n- Tafel slope:\n- Current density @:\n\n## Stability\n[Track degradation]',
        },
      ],
      tags: ['Electrocatalysis', 'CV', 'LSV', 'Activity'],
    },
  },
  {
    id: 'sensor',
    name: 'Electrochemical Sensor',
    description: 'Template for sensor development and calibration studies',
    researchType: 'Sensors',
    icon: '📡',
    defaultStructure: {
      pages: [
        {
          title: 'Project Overview',
          content: '# Sensor Development\n\n## Objectives\n- [ ] Develop sensor\n- [ ] Calibration\n- [ ] Selectivity testing\n\n## Target Analyte\n- Compound:\n- Detection method:\n- Expected range:',
        },
        {
          title: 'Sensor Characterization',
          content: '# Characterization\n\n## CV Characterization\n- Scan rate study\n- pH optimization\n- Concentration range\n\n## Amperometric Detection\n- Applied potential:\n- Response time:\n\n## Calibration\n- Concentration range:\n- Number of points:',
        },
        {
          title: 'Performance Metrics',
          content: '# Sensor Performance\n\n## Calibration Curve\n[Upload data]\n\n## Metrics\n- Sensitivity:\n- LOD:\n- LOQ:\n- Linear range:\n\n## Selectivity\n[Test interferents]',
        },
      ],
      tags: ['Sensor', 'Detection', 'Calibration', 'Amperometry'],
    },
  },
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    researchType: 'Other',
    icon: '📝',
    defaultStructure: {
      pages: [
        {
          title: 'Notes',
          content: '# Research Notes\n\nStart documenting your research here...',
        },
      ],
      tags: [],
    },
  },
]

export function getTemplate(id: string): ProjectTemplate | undefined {
  return projectTemplates.find((t) => t.id === id)
}
