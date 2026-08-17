import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

type ElementType = 'text' | 'dropdown' | 'radio' | 'gps' | 'photo' | 'section' | 'date' | 'number';

interface SurveyElement {
  id: string;
  type: ElementType;
  label: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // for radio/dropdown
  gpsHighAccuracy?: boolean;
  gpsMockLocation?: boolean;
  parentQuestionId?: string;
  showIfParentValue?: string;
  isRepeatable?: boolean;
}

const SurveyBuilder = () => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [surveyTitle, setSurveyTitle] = useState('Network Quality & Competitor Survey');
  const [isPublishing, setIsPublishing] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isEditMode = searchParams.get('edit') === 'true';
  const surveyId = searchParams.get('id');

  const [elements, setElements] = useState<SurveyElement[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeElement = elements.find((el) => el.id === activeId);

  useEffect(() => {
    if (isEditMode) {
      const endpoint = surveyId ? `/surveys/templates/${surveyId}` : '/surveys/active';
      api.get(endpoint).then(res => {
        if (res.data?.data) {
          setSurveyTitle(res.data.data.title);
          try {
            if (res.data.data.sections && Array.isArray(res.data.data.sections)) {
              const flatElements: any[] = [];
              res.data.data.sections.forEach((sec: any) => {
                flatElements.push({
                  id: `sec_${sec.id}`,
                  type: 'section',
                  label: sec.title,
                  required: false,
                  isRepeatable: sec.isRepeatable || false
                });
                sec.questions?.forEach((q: any) => {
                  let opts = q.options;
                  if (typeof opts === 'string') {
                     try { opts = JSON.parse(opts); } catch(e){}
                  }
                  flatElements.push({
                    id: `q_${q.id}`,
                    type: q.type,
                    label: q.questionText,
                    required: q.isRequired || false,
                    options: Array.isArray(opts) ? opts : undefined
                  });
                });
              });
              setElements(flatElements);
            } else if (res.data.data.schema) {
              const schema = JSON.parse(res.data.data.schema);
              if (Array.isArray(schema)) setElements(schema);
            }
          } catch (e) {
            console.error('Failed to parse survey schema', e);
          }
        }
      }).catch(console.error);
    }
  }, [isEditMode]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const oldIndex = elements.findIndex((el) => el.id === draggedId);
    const newIndex = elements.findIndex((el) => el.id === targetId);

    const newElements = [...elements];
    const [draggedEl] = newElements.splice(oldIndex, 1);
    newElements.splice(newIndex, 0, draggedEl);

    setElements(newElements);
    setDraggedId(null);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const cleanedElements = elements.map(el => {
        if (el.options && Array.isArray(el.options)) {
          return { ...el, options: el.options.filter(opt => opt.trim() !== '') };
        }
        return el;
      });

      if (isEditMode && surveyId) {
        await api.put(`/surveys/config/${surveyId}`, { title: surveyTitle, schema: cleanedElements });
      } else {
        await api.post('/surveys/config', { title: surveyTitle, schema: cleanedElements });
      }
      setShowPublishModal(false);
      toast.success('Survey published successfully to all devices!');
    } catch (e) {
      console.error(e);
      toast.error('Error publishing survey');
    } finally {
      setIsPublishing(false);
    }
  };

  const addElement = (type: ElementType) => {
    const newId = 'el_' + Date.now();
    const newEl: SurveyElement = {
      id: newId,
      type,
      label: type === 'section' ? 'New Section Heading' : `New ${type} question`,
      required: false,
      isRepeatable: false,
    };
    if (type === 'radio' || type === 'dropdown') {
      newEl.options = ['Option 1', 'Option 2', 'Option 3'];
    }
    if (type === 'gps') {
      newEl.gpsHighAccuracy = true;
      newEl.gpsMockLocation = false;
    }
    setElements([...elements, newEl]);
    setActiveId(newId);
  };

  const updateElement = (id: string, updates: Partial<SurveyElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setElements(elements.filter((el) => el.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const elToDup = elements.find((el) => el.id === id);
    if (elToDup) {
      const newEl = { ...elToDup, id: 'el_' + Date.now() };
      setElements([...elements, newEl]);
      setActiveId(newEl.id);
    }
  };

  const handleOptionsChange = (id: string, value: string) => {
    const opts = value.split('\n');
    updateElement(id, { options: opts });
  };

  return (
    <main className="h-full flex flex-col bg-transparent">
      {/* Header Area */}
      <div className="p-6 flex justify-between items-center glass-panel border border-panel-border rounded-2xl mb-4 shrink-0">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-transparent/5 text-text-muted border border-panel-border">Draft</span>
            <p className="text-sm text-text-muted">Last saved: Just now</p>
          </div>
          <input
            type="text"
            value={surveyTitle}
            onChange={(e) => setSurveyTitle(e.target.value)}
            className="text-2xl font-bold font-['Outfit'] text-text-main bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full max-w-2xl"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setShowPreviewModal(true)} className="px-4 py-2 bg-transparent/5 hover:bg-transparent/10 text-text-sub rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            Preview
          </button>
          <button onClick={() => setShowPublishModal(true)} className="px-4 py-2 glass-button rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.956 11.956 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Publish Survey
          </button>
        </div>
      </div>

      {/* Builder 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Toolbox */}
        <div className="w-64 glass-panel border border-panel-border rounded-2xl mr-4 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-4 border-b border-panel-border bg-panel-bg">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Form Elements</h3>
          </div>
          <div className="p-4 space-y-3">
            <button onClick={() => addElement('text')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              <span className="text-sm font-medium">Short Text</span>
            </button>
            <button onClick={() => addElement('dropdown')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              <span className="text-sm font-medium">Dropdown List</span>
            </button>
            <button onClick={() => addElement('radio')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-sm font-medium">Multiple Choice</span>
            </button>
            <button onClick={() => addElement('gps')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-sm font-medium">GPS Check-in</span>
            </button>
            <button onClick={() => addElement('photo')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span className="text-sm font-medium">Photo Upload</span>
            </button>
            <button onClick={() => addElement('number')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
              <span className="text-sm font-medium">Number</span>
            </button>
            <button onClick={() => addElement('date')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-slate-500/20 hover:border-slate-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span className="text-sm font-medium">Date Picker</span>
            </button>
            <button onClick={() => addElement('section')} className="w-full p-3 border border-panel-border rounded-lg hover:bg-purple-500/20 hover:border-purple-500/30 transition-colors flex items-center gap-3 bg-panel-bg backdrop-blur-sm text-text-sub">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              <span className="text-sm font-medium">Section Heading</span>
            </button>
          </div>
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 glass-panel border border-panel-border rounded-2xl p-8 overflow-y-auto relative shrink-0 min-w-0">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="max-w-2xl mx-auto bg-panel-bg backdrop-blur-xl rounded-3xl shadow-lg border border-panel-border min-h-full p-8 relative z-10">
            {elements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-50">
                <svg className="w-16 h-16 text-text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
                <p className="text-center text-text-main font-medium">Survey is empty</p>
                <p className="text-center text-text-muted text-sm mt-1">Click elements on the left to add them here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {elements.map((el, index) => {
                  const isActive = el.id === activeId;
                  return (
                    <div 
                      key={el.id} 
                      onClick={() => setActiveId(el.id)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, el.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, el.id)}
                      onDragEnd={() => setDraggedId(null)}
                      className={`group relative p-5 -mx-5 rounded-xl transition-all cursor-pointer ${
                        draggedId === el.id ? 'opacity-40 scale-[0.98] ' : ''
                      }${
                        isActive 
                          ? 'border-2 border-slate-500 shadow-sm bg-panel-bg' 
                          : 'border-2 border-transparent hover:border-panel-border bg-transparent'
                      }`}
                    >
                      {/* Drag Handle */}
                      <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-text-muted opacity-100  p-2 hidden sm:block">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9h8M8 15h8"></path></svg>
                      </div>
                      {/* Action Icons */}
                      <div className={`absolute right-3 top-3 flex gap-2  ${isActive ? 'opacity-100' : 'opacity-100'}`}>
                        <button onClick={(e) => duplicateElement(e, el.id)} className="p-2 bg-panel-solid text-text-sub rounded-lg hover:bg-panel-border transition-colors border border-panel-border" title="Duplicate">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path></svg>
                        </button>
                        <button onClick={(e) => deleteElement(e, el.id)} className="p-2 bg-danger-bg text-danger-text rounded-lg hover:bg-danger-bg transition-colors border border-danger-border" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>

                      <label className={`flex items-center font-medium mb-3 ${isActive ? 'text-slate-400' : 'text-text-main'} ${el.type === 'section' ? 'text-lg text-purple-400 border-b border-panel-border pb-2 uppercase tracking-wide' : 'text-sm'}`}>
                        {el.type === 'section' ? el.label : `${index + 1}. ${el.label}`} 
                        {el.required && el.type !== 'section' && <span className="text-danger-text ml-1">*</span>}
                        {el.type === 'section' && el.isRepeatable && <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-[10px] font-bold tracking-wider">REPEATABLE</span>}
                      </label>
                      {el.helpText && <p className="text-xs text-text-muted mb-3">{el.helpText}</p>}

                      {/* Element Previews */}
                      {el.type === 'text' && (
                        <input type="text" disabled placeholder="Short text answer" className="w-full border-b border-panel-border py-2 bg-transparent text-sm text-text-muted placeholder-slate-500" />
                      )}

                      {el.type === 'number' && (
                        <input type="text" disabled placeholder="Numeric answer (e.g. +92300...)" className="w-full border-b border-panel-border py-2 bg-transparent text-sm text-text-muted placeholder-slate-500" />
                      )}

                      {el.type === 'date' && (
                        <input type="date" disabled className="w-full border-b border-panel-border py-2 bg-transparent text-sm text-text-muted opacity-50" />
                      )}
                      
                      {el.type === 'dropdown' && (
                        <select disabled className="w-full border-b border-panel-border py-2 bg-transparent text-sm text-text-muted">
                          <option>Select an option</option>
                        </select>
                      )}

                      {el.type === 'radio' && (
                        <div className="space-y-3 mt-2">
                          {el.options?.filter(opt => opt.trim() !== '').map((opt, i) => (
                            <label key={i} className="flex items-center gap-3 text-sm text-text-muted">
                              <div className="w-4 h-4 rounded-full border border-white/30 bg-transparent flex-shrink-0"></div>
                              {opt}
                            </label>
                          ))}
                        </div>
                      )}

                      {el.type === 'gps' && (
                        <div className="flex items-center gap-2 p-4 bg-slate-500/5 border border-slate-500/20 rounded-xl text-slate-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                          <span className="text-sm font-medium">GPS Location Check-in</span>
                        </div>
                      )}

                      {el.type === 'photo' && (
                        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-panel-border rounded-xl bg-panel-solid/30">
                          <svg className="w-8 h-8 text-text-muted mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                          <span className="text-sm text-text-muted">Photo Upload Field</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Add placeholder */}
            <div className="border-2 border-dashed border-panel-border rounded-xl p-6 text-center mt-8 bg-transparent">
               <p className="text-sm text-text-muted">Click elements on the left to add more questions</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties */}
        <div className="w-80 glass-panel border border-panel-border rounded-2xl ml-4 overflow-y-auto shrink-0 flex flex-col">
          <div className="p-4 border-b border-panel-border bg-panel-bg">
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Field Properties</h3>
          </div>
          
          <div className="p-5 flex-1">
            {!activeElement ? (
              <p className="text-sm text-text-muted text-center mt-10">Select an element to edit properties.</p>
            ) : (
              <div className="space-y-6">
                {activeElement.type !== 'section' && (
                  <div>
                    <label className="block text-sm font-medium text-text-sub mb-2">Question Type</label>
                    <select 
                      value={activeElement.type}
                      onChange={(e) => updateElement(activeElement.id, { type: e.target.value as any })}
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm bg-panel-solid focus:outline-none text-text-main"
                    >
                      <option value="text">Short Text</option>
                      <option value="number">Number</option>
                      <option value="dropdown">Dropdown Options</option>
                      <option value="radio">Multiple Choice (Radio)</option>
                      <option value="photo">Photo / Camera</option>
                      <option value="gps">GPS Location</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Question Title</label>
                  <input 
                    type="text" 
                    value={activeElement.label}
                    onChange={(e) => updateElement(activeElement.id, { label: e.target.value })}
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm" 
                  />
                </div>

                {activeElement.type === 'section' && (
                  <div className="flex items-center justify-between py-3 border-y border-panel-border">
                    <div>
                      <p className="text-sm font-medium text-text-sub">Repeatable Section</p>
                      <p className="text-xs text-text-muted">Users can add multiple entries for this section</p>
                    </div>
                    <button 
                      onClick={() => updateElement(activeElement.id, { isRepeatable: !activeElement.isRepeatable })}
                      className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${activeElement.isRepeatable ? 'bg-purple-500' : 'bg-panel-border'}`}
                    >
                      <div className={`w-4 h-4 bg-panel-solid rounded-full transition-transform shadow-sm ${activeElement.isRepeatable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                )}

                {activeElement.type !== 'section' && (
                  <div className="flex items-center justify-between py-3 border-y border-panel-border">
                    <div>
                      <p className="text-sm font-medium text-text-sub">Required Field</p>
                      <p className="text-xs text-text-muted">Must be filled to submit</p>
                    </div>
                    <button 
                      onClick={() => updateElement(activeElement.id, { required: !activeElement.required })}
                      className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${activeElement.required ? 'bg-slate-500' : 'bg-panel-border'}`}
                    >
                      <div className={`w-4 h-4 bg-panel-solid rounded-full transition-transform shadow-sm ${activeElement.required ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-text-sub mb-2">Help Text (Optional)</label>
                  <textarea 
                    rows={3} 
                    value={activeElement.helpText || ''}
                    onChange={(e) => updateElement(activeElement.id, { helpText: e.target.value })}
                    placeholder="Add instruction for TSO..." 
                    className="w-full px-3 py-2 glass-input rounded-lg text-sm"
                  ></textarea>
                </div>

                {(activeElement.type === 'radio' || activeElement.type === 'dropdown') && (
                  <div>
                    <label className="block text-sm font-medium text-text-sub mb-2">Options (One per line)</label>
                    <textarea 
                      rows={5} 
                      value={activeElement.options?.join('\n') || ''}
                      onChange={(e) => handleOptionsChange(activeElement.id, e.target.value)}
                      className="w-full px-3 py-2 glass-input rounded-lg text-sm font-mono"
                    ></textarea>
                  </div>
                )}
                
                {activeElement.type === 'gps' && (
                  <div className="p-4 bg-panel-solid/30 rounded-lg border border-panel-border">
                    <p className="text-xs font-medium text-text-sub uppercase mb-3">GPS Settings</p>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={activeElement.gpsHighAccuracy}
                            onChange={(e) => updateElement(activeElement.id, { gpsHighAccuracy: e.target.checked })}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-slate-600 rounded bg-transparent peer-checked:bg-slate-500 peer-checked:border-slate-500 transition-colors"></div>
                          <svg className="w-3.5 h-3.5 text-text-main absolute pointer-events-none opacity-0 peer-checked:opacity-100 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="ml-3 text-sm text-text-sub group-hover:text-text-main transition-colors">Force high-accuracy mode</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={activeElement.gpsMockLocation}
                            onChange={(e) => updateElement(activeElement.id, { gpsMockLocation: e.target.checked })}
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-slate-600 rounded bg-transparent peer-checked:bg-slate-500 peer-checked:border-slate-500 transition-colors"></div>
                          <svg className="w-3.5 h-3.5 text-text-main absolute pointer-events-none opacity-0 peer-checked:opacity-100 " fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="ml-3 text-sm text-text-sub group-hover:text-text-main transition-colors">Allow mock locations</span>
                      </label>
                    </div>
                  </div>
                )}
                
                {activeElement.type !== 'section' && (
                  <div className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                    <p className="text-xs font-medium text-purple-400 uppercase mb-3">Conditional Logic (Parent/Child)</p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-text-sub mb-1">Show if Parent Question...</label>
                        <select 
                          value={activeElement.parentQuestionId || ''}
                          onChange={(e) => updateElement(activeElement.id, { parentQuestionId: e.target.value })}
                          className="w-full px-3 py-2 bg-panel-solid border border-panel-border rounded-lg text-sm text-text-main focus:outline-none"
                        >
                          <option value="">No Parent (Always Show)</option>
                          {elements.filter(el => el.id !== activeElement.id && (el.type === 'radio' || el.type === 'dropdown')).map(el => (
                            <option key={el.id} value={el.id}>{el.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      {activeElement.parentQuestionId && (
                        <div>
                          <label className="block text-xs font-medium text-text-sub mb-1">Has this specific value:</label>
                          <input 
                            type="text" 
                            value={activeElement.showIfParentValue || ''}
                            onChange={(e) => updateElement(activeElement.id, { showIfParentValue: e.target.value })}
                            placeholder="e.g. Dealer"
                            className="w-full px-3 py-2 bg-panel-solid border border-panel-border rounded-lg text-sm text-text-main focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="w-[375px] h-[750px] bg-panel-solid rounded-[3rem] shadow-sm overflow-hidden border-[12px] border-panel-solid relative flex flex-col">
              <div className="absolute top-0 w-full h-6 bg-panel-solid rounded-b-3xl z-20 flex justify-center">
                <div className="w-32 h-6 bg-black rounded-b-3xl"></div> 
              </div>
              
              <div className="flex-1 bg-[#0f172a] overflow-y-auto pt-12 pb-8 px-5 relative z-10">
                <h2 className="text-xl font-bold text-text-main mb-6 font-['Outfit']">{surveyTitle}</h2>
                
                {elements.length === 0 ? (
                  <p className="text-text-muted text-sm text-center mt-10">No questions in this survey.</p>
                ) : (
                  <div className="space-y-6">
                    {elements.map((el, i) => (
                      <div key={el.id} className="p-4 bg-panel-solid/5 rounded-xl border border-panel-border">
                        <label className={`block font-medium mb-2 ${el.type === 'section' ? 'text-lg text-purple-400 border-b border-panel-border pb-2 uppercase tracking-wide mt-4' : 'text-sm text-text-sub'}`}>
                          {el.type === 'section' ? el.label : `${i + 1}. ${el.label}`} 
                          {el.required && el.type !== 'section' && <span className="text-danger-text ml-1">*</span>}
                        </label>
                        {el.helpText && <p className="text-xs text-text-muted mb-3">{el.helpText}</p>}
                        
                        {el.type === 'text' && (
                          <input type="text" placeholder="Enter answer" className="w-full px-4 py-3 bg-panel-bg border border-panel-border rounded-xl text-sm text-text-main focus:outline-none focus:border-slate-500" />
                        )}

                        {el.type === 'number' && (
                          <input type="text" placeholder="Enter number" className="w-full px-4 py-3 bg-panel-bg border border-panel-border rounded-xl text-sm text-text-main focus:outline-none focus:border-slate-500" />
                        )}

                        {el.type === 'date' && (
                          <input type="date" className="w-full px-4 py-3 bg-panel-bg border border-panel-border rounded-xl text-sm text-text-main focus:outline-none focus:border-slate-500" />
                        )}

                        {el.type === 'dropdown' && (
                          <select className="w-full px-4 py-3 bg-panel-bg border border-panel-border rounded-xl text-sm text-text-main focus:outline-none focus:border-slate-500 appearance-none">
                            <option value="">Select option</option>
                            {el.options?.filter(o => o.trim() !== '').map((o, idx) => <option key={idx} value={o}>{o}</option>)}
                          </select>
                        )}

                        {el.type === 'radio' && (
                          <div className="space-y-2">
                            {el.options?.filter(o => o.trim() !== '').map((o, idx) => (
                              <label key={idx} className="flex items-center gap-3 p-3 bg-panel-solid/30 rounded-lg border border-panel-border">
                                <input type="radio" name={el.id} className="w-4 h-4 text-slate-500 border-panel-border bg-transparent" />
                                <span className="text-sm text-text-sub">{o}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {el.type === 'gps' && (
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-500/10 text-slate-400 border border-slate-500/30 rounded-xl font-medium hover:bg-slate-500/20 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                            Tap to record location
                          </button>
                        )}

                        {el.type === 'photo' && (
                          <button className="w-full flex flex-col items-center justify-center gap-2 p-6 bg-panel-solid/30 border-2 border-dashed border-panel-border rounded-xl text-text-muted hover:text-slate-400 hover:border-slate-500/30 transition-colors">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span className="text-sm font-medium">Take Photo</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {elements.length > 0 && (
                  <button className="w-full mt-8 glass-button font-medium py-3 rounded-xl">Submit Survey</button>
                )}
              </div>
            </div>
            
            <button onClick={() => setShowPreviewModal(false)} className="absolute -right-16 top-0 w-12 h-12 bg-panel-solid rounded-full flex items-center justify-center text-text-sub hover:text-text-main shadow-xl transition-colors border border-panel-border">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-panel-bg backdrop-blur-md flex items-center justify-center z-50">
          <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all text-center p-6 border border-panel-border">
            <div className="w-16 h-16 bg-slate-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-500/30">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="font-bold font-['Outfit'] text-xl text-text-main mb-2">Publish Survey?</h3>
            <p className="text-text-muted text-sm mb-6">This survey will be instantly published and pushed to the mobile devices of all active TSOs. Confirm?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPublishModal(false)} disabled={isPublishing} className="flex-1 px-4 py-2 bg-panel-solid text-text-sub rounded-lg font-medium hover:bg-panel-border transition-colors border border-panel-border">Keep Draft</button>
              <button onClick={handlePublish} disabled={isPublishing} className="flex-1 px-4 py-2 glass-button rounded-lg font-medium">
                {isPublishing ? 'Publishing...' : 'Publish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default SurveyBuilder;
