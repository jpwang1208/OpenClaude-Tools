import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores/settingsStore';
import {
  Plus,
  RefreshCw,
  Cpu,
  Globe,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  provider: string;
  type: 'local' | 'remote';
  status: 'active' | 'inactive';
  apiKey?: string;
  baseUrl?: string;
}

// Mock data - in real app would come from config
const mockModels: Model[] = [
  { id: '1', name: 'gpt-4o', provider: 'OpenAI', type: 'remote', status: 'active' },
  { id: '2', name: 'claude-3-opus', provider: 'Anthropic', type: 'remote', status: 'active' },
  { id: '3', name: 'llama-3', provider: 'Local', type: 'local', status: 'inactive' },
];

export function ModelsMgmtPage() {
  const { t } = useTranslation();
  const { theme } = useSettingsStore();
  const [models] = useState<Model[]>(mockModels);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'remote'>('all');

  const filteredModels = models.filter((model) => {
    if (activeTab === 'all') return true;
    return model.type === activeTab;
  });

  const handleToggleModel = (modelId: string) => {
    console.log('Toggle model:', modelId);
  };

  return (
    <div className={`main-content ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-900'}`}>
      {/* Content Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            {t('models.title')}
          </h1>
          <p className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>
            {t('models.subtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            className={`btn-secondary flex items-center gap-2`}
          >
            <RefreshCw size={16} />
            {t('models.refresh')}
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            {t('models.add')}
          </button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className={`flex gap-8 border-b mb-8 ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
        {(['all', 'local', 'remote'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              pb-4 border-b-2 font-medium transition-all
              ${activeTab === tab
                ? 'border-indigo-500 text-indigo-600'
                : theme === 'light'
                  ? 'border-transparent text-slate-400 hover:text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }
            `}
          >
            {t(`models.${tab}`)}
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-700 text-slate-400'}`}>
              {tab === 'all' ? models.length : models.filter(m => m.type === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className={`py-12 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
          {t('models.noModels')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div 
              key={model.id} 
              className={`card card-hover flex flex-col`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-indigo-50' : 'bg-indigo-900/30'}`}>
                  {model.type === 'remote' ? (
                    <Globe size={24} className="text-indigo-500" />
                  ) : (
                    <Cpu size={24} className="text-indigo-500" />
                  )}
                </div>
                <span 
                  className={`
                    tag font-bold
                    ${model.status === 'active' ? 'tag-success' : 'tag-warning'}
                  `}
                >
                  <span className={`status-dot ${model.status === 'active' ? 'status-active' : 'status-paused'}`}></span>
                  {model.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <h3 className={`text-xl font-bold mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                {model.name}
              </h3>
              <p className={`text-sm mb-6 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {model.provider} • {model.type === 'remote' ? t('models.remote') : t('models.local')}
              </p>

              <div className={`flex items-center justify-between pt-4 border-t ${theme === 'light' ? 'border-slate-100' : 'border-slate-700'}`}>
                <div className={`flex gap-3 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  <button 
                    onClick={() => handleToggleModel(model.id)}
                    className={`hover:text-indigo-500 transition-colors flex items-center`}
                  >
                    {model.status === 'active' ? (
                      <ToggleRight size={20} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={20} />
                    )}
                  </button>
                  <button className={`hover:text-indigo-500 transition-colors`}>
                    <Edit2 size={16} />
                  </button>
                  <button className={`hover:text-red-500 transition-colors`}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <button 
                  className={`text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-sm`}
                >
                  {t('models.configure')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}