import React, { useState, useRef } from 'react';
import { processText, generateMoreQuestions } from './services/geminiService';
import { ProcessingResult, QuestionType, LoadingState, Difficulty, Question } from './types';

// --- Icons (Refined) ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const CheckCircleIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DocumentIcon = ({ className = "h-12 w-12" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = ({ className = "h-12 w-12" }: { className?: string }) => (
   <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
   </svg>
);

const ArrowRightIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const ArrowLeftIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
  </svg>
);

const RefreshIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PlusIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChartBarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const LightBulbIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

type ViewState = 'input' | 'summary' | 'questions' | 'extra_questions' | 'results';

const App = () => {
  const [view, setView] = useState<ViewState>('input');
  // Store the previous view to know which set of questions to return to (optional navigation)
  const [previousQuestionsView, setPreviousQuestionsView] = useState<'questions' | 'extra_questions'>('questions');
  
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Intermediate);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle', message: '' });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [extraQuestions, setExtraQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Question Interaction States (Global Indexing)
  // Index 0..N are initial questions
  // Index N+1..M are extra questions
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [validationResults, setValidationResults] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const validPdfTypes = ['application/pdf'];

    if (validImageTypes.includes(fileType) || validPdfTypes.includes(fileType)) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const base64Data = result.split(',')[1]; 
            setAttachment({
                name: file.name,
                data: base64Data,
                mimeType: fileType
            });
            setInputText(''); 
        };
        reader.readAsDataURL(file);
    } else {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setInputText(text);
            setAttachment(null);
        };
        reader.readAsText(file);
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetSession = () => {
    setView('input');
    setAttachment(null);
    setInputText('');
    setDifficulty(Difficulty.Intermediate);
    setResult(null);
    setExtraQuestions([]);
    setError(null);
    setLoadingState({ status: 'idle', message: '' });
    // Reset all interaction states
    setRevealedAnswers(new Set());
    setSelectedOptions({});
    setUserAnswers({});
    setValidationResults({});
    setExpandedQuestions(new Set());
  };

  const handleProcess = async () => {
    if (!inputText.trim() && !attachment) {
      setError("Please enter some text or upload a file.");
      return;
    }

    setLoadingState({ status: 'analyzing', message: 'Analyzing content...' });
    setError(null);
    setResult(null);
    setExtraQuestions([]);
    
    // Reset states for new session processing
    setRevealedAnswers(new Set());
    setSelectedOptions({});
    setUserAnswers({});
    setValidationResults({});
    setExpandedQuestions(new Set());

    try {
      const inputData = attachment ? { data: attachment.data, mimeType: attachment.mimeType } : inputText;
      const data = await processText(inputData, undefined, difficulty, (status) => {
        setLoadingState(prev => ({ ...prev, message: status }));
      });
      setResult(data);
      setLoadingState({ status: 'complete', message: '' });
      setView('summary');
      setExpandedQuestions(new Set([0]));
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoadingState({ status: 'error', message: '' });
    }
  };

  const handleGenerateMore = async () => {
     if (!result) return;
     setLoadingState({ status: 'generating_questions', message: 'Generating additional questions...' });
     
     try {
        const inputData = attachment ? { data: attachment.data, mimeType: attachment.mimeType } : inputText;
        const moreQuestions = await generateMoreQuestions(inputData, result.questions, result.domain, result.difficulty);
        setExtraQuestions(moreQuestions);
        // NOTE: We do NOT reset question states here to preserve history of initial questions
        setView('extra_questions');
        setLoadingState({ status: 'complete', message: '' });
        // Expand the first question of the NEW batch
        setExpandedQuestions(new Set([result.questions.length]));
     } catch (err: any) {
         setError(err.message || "Could not generate more questions.");
         setLoadingState({ status: 'error', message: '' });
     }
  };

  const handleViewResults = () => {
    if (view === 'questions' || view === 'extra_questions') {
      setPreviousQuestionsView(view);
    }
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAnswer = (index: number) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(index)) newRevealed.delete(index);
    else newRevealed.add(index);
    setRevealedAnswers(newRevealed);
  };

  const toggleQuestionExpand = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedQuestions(newExpanded);
  };

  const handleOptionSelect = (qIndex: number, optIndex: number) => {
    // Lock selection if already selected
    if (selectedOptions[qIndex] !== undefined) return;
    setSelectedOptions(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const handleShortAnswerChange = (idx: number, text: string) => {
    setUserAnswers(prev => ({ ...prev, [idx]: text }));
  };

  const validateShortAnswer = (idx: number, modelAnswer: string) => {
    if (!userAnswers[idx]?.trim()) return;

    // Filter out common stop words to focus only on relevant keywords
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'it', 'to', 'of', 'for', 'with', 'as', 'by', 'that', 'this', 'are', 'was', 'were']);

    const normalize = (text: string) => text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));

    const userTokens = new Set(normalize(userAnswers[idx]));
    const modelTokens = normalize(modelAnswer);

    // Calculate overlap of relevant keywords
    const matches = modelTokens.filter(t => userTokens.has(t)).length;
    
    // We check if a significant portion of the *model's keywords* are present in the user's answer
    const score = matches / (modelTokens.length || 1);
    
    // Threshold: 25% keyword overlap is considered relevant/correct for short answers
    const isCorrect = modelTokens.length === 0 ? true : score >= 0.25;

    setValidationResults(prev => ({ ...prev, [idx]: isCorrect ? 'correct' : 'incorrect' }));
    
    // Reveal answer
    const newRevealed = new Set(revealedAnswers);
    newRevealed.add(idx);
    setRevealedAnswers(newRevealed);
  };

  const calculateScore = (questions: Question[]) => {
    let correctCount = 0;
    let totalScorable = 0;

    questions.forEach((q, idx) => {
        if (q.type === QuestionType.MCQ) {
            totalScorable++;
            if (selectedOptions[idx] === q.correct_index) {
                correctCount++;
            }
        } else if (q.type === QuestionType.ShortAnswer) {
            totalScorable++;
            if (validationResults[idx] === 'correct') {
                correctCount++;
            }
        }
        // Analytical questions are excluded from strict percentage but shown in breakdown
    });

    return { correct: correctCount, total: totalScorable, percentage: totalScorable === 0 ? 0 : Math.round((correctCount / totalScorable) * 100) };
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl opacity-60"></div>
          <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl opacity-60"></div>
      </div>

      {/* Header */}
      <header className="glass border-b border-white/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => view !== 'input' && setView('input')}>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-serif tracking-tight">ScholarGen</h1>
            </div>
          </div>
          <div className="font-bold tracking-widest text-sm">
             <span className="text-black">CODE</span> <span className="text-violet-600">ATTI</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-12 min-h-[calc(100vh-80px)]">
        
        {/* VIEW: INPUT SECTION */}
        {view === 'input' && (
          <section className="animate-fade-in-up">
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 leading-tight">
                Tell Me What I Want To <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Summarize</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Upload your lecture notes, papers, or book chapters. We'll create a personalized study package.
              </p>
            </div>

            {/* Difficulty Selector */}
            <div className="flex flex-col items-center gap-3 mb-8">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Target Difficulty</span>
                <div className="inline-flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    {Object.values(Difficulty).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                                difficulty === level
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                                    : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-white overflow-hidden relative group">
              <div className="p-1">
                <div className="relative bg-slate-50/50 rounded-xl border-2 border-dashed border-indigo-100 group-hover:border-indigo-300 transition-all duration-300">
                  {attachment ? (
                    <div className="w-full h-64 flex flex-col items-center justify-center relative animate-fade-in">
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl z-0"></div>
                      <div className="relative z-10 flex flex-col items-center p-8 text-center">
                          <div className="bg-white p-4 rounded-2xl shadow-lg mb-4 transform group-hover:scale-105 transition-transform duration-300">
                            {attachment.mimeType.startsWith('image') ? (
                              <ImageIcon className="h-10 w-10 text-indigo-600" />
                            ) : (
                              <DocumentIcon className="h-10 w-10 text-red-500" />
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 max-w-md truncate px-4">{attachment.name}</h3>
                          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mt-1">{attachment.mimeType.split('/')[1]} FILE</p>
                      </div>
                      <button 
                        onClick={clearAttachment}
                        className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:bg-red-50 hover:text-red-500 transition-all z-20"
                        title="Remove file"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <textarea 
                      className="w-full h-64 p-8 bg-transparent border-none focus:ring-0 text-lg text-slate-700 placeholder:text-slate-400 resize-none transition-all"
                      placeholder="Paste your text here or upload a file..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  )}
                  
                  <div className="absolute bottom-6 right-6 z-20">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept=".txt,.md,.pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    {!attachment && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex items-center gap-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 px-5 py-2.5 rounded-xl shadow-sm transition-all font-medium"
                      >
                        <UploadIcon />
                        <span>Upload File</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Bar */}
              <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between">
                <div className="text-sm text-slate-400 font-medium hidden sm:block">
                  Supports PDF, IMG, TXT
                </div>
                <button 
                    onClick={handleProcess}
                    disabled={loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error'}
                    className={`ml-auto px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all transform active:scale-[0.98] flex items-center gap-2.5
                      ${loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error'
                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/40'
                      }`}
                  >
                    {loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error' ? (
                      <>
                        <svg className="animate-spin -ml-1 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="tracking-wide">{loadingState.message || "Processing..."}</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon />
                        Generate Study Package
                      </>
                    )}
                  </button>
              </div>
              
              {loadingState.status !== 'idle' && loadingState.status !== 'complete' && loadingState.status !== 'error' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 overflow-hidden z-30">
                    <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-progress"></div>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 shadow-sm animate-fade-in">
                <div className="bg-red-100 p-2 rounded-full">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </section>
        )}

        {/* VIEW: SUMMARY PAGE */}
        {view === 'summary' && result && (
          <div className="animate-fade-in space-y-8">
            {/* Meta Header */}
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-b border-slate-200 pb-6">
               <div className="flex gap-3">
                 <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-full text-sm font-semibold shadow-sm">
                   {result.domain}
                 </span>
                 <span className={`px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm border ${
                   result.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                   result.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                   'bg-rose-50 text-rose-700 border-rose-100'
                 }`}>
                   {result.difficulty}
                 </span>
               </div>
               {result.meta.original_words > 0 && (
                 <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm">
                   <span className="w-2 h-2 rounded-full bg-green-400"></span>
                   Conciseness increased by {(100 - (result.meta.summary_words / result.meta.original_words * 100)).toFixed(0)}%
                 </div>
               )}
            </div>

            {/* Summary Content */}
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-white overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                  <h3 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 text-sm font-sans font-bold">1</span>
                    Contextual Summary
                  </h3>
                </div>
                <div className="p-8 md:p-10 bg-white">
                  <div className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed font-light">
                    {result.summary.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={resetSession}
                className="order-2 sm:order-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2"
              >
                <RefreshIcon />
                Start New Session
              </button>
              
              <button 
                onClick={() => {
                  setView('questions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="order-1 sm:order-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/40 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-3"
              >
                <span>Generate Questions</span>
                <ArrowRightIcon />
              </button>
            </div>
          </div>
        )}

        {/* VIEW: QUESTIONS PAGE (AND EXTRA QUESTIONS) */}
        {(view === 'questions' || view === 'extra_questions') && result && (
           <div className="animate-fade-in space-y-8">
             
             {/* Loading Overlay for Extra Questions */}
             {loadingState.status === 'generating_questions' && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 border border-indigo-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-100 border-t-indigo-600"></div>
                        <p className="text-lg font-semibold text-indigo-900 animate-pulse">Creating new questions...</p>
                    </div>
                </div>
             )}

             <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-600 text-sm font-sans font-bold">
                        {view === 'extra_questions' ? '+' : '2'}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-slate-800">
                      {view === 'extra_questions' ? 'Bonus Assessment Questions' : 'Assessment Questions'}
                    </h3>
                 </div>
                 
                 <div className="space-y-5">
                  {/* Logic for determining which batch to show and correct index offset */}
                  {(() => {
                      const currentBatch = view === 'extra_questions' ? extraQuestions : result.questions;
                      const startIndex = view === 'extra_questions' ? result.questions.length : 0;
                      
                      return currentBatch.map((q, relativeIdx) => {
                          const idx = startIndex + relativeIdx; // Global Index
                          return (
                            <div key={idx} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
                                ${expandedQuestions.has(idx) 
                                    ? 'shadow-xl shadow-indigo-100/40 border-indigo-100' 
                                    : 'shadow-sm border-slate-100 hover:border-indigo-100 hover:shadow-md'}`}>
                            
                            {/* Question Header */}
                            <div 
                                className="p-6 cursor-pointer flex gap-5 items-start"
                                onClick={() => toggleQuestionExpand(idx)}
                            >
                                <div className="flex-shrink-0 pt-1">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                                    ${q.type === QuestionType.MCQ ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 
                                        q.type === QuestionType.ShortAnswer ? 'bg-sky-50 text-sky-700 border border-sky-100' : 
                                        'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {q.type === QuestionType.MCQ ? 'MCQ' : q.type === QuestionType.ShortAnswer ? 'Short' : 'Analysis'}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                <p className={`text-lg font-medium transition-colors leading-relaxed ${expandedQuestions.has(idx) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {q.question}
                                </p>
                                </div>
                                <div className={`flex-shrink-0 transform transition-transform duration-300 text-slate-300 group-hover:text-indigo-400 ${expandedQuestions.has(idx) ? 'rotate-180 text-indigo-500' : ''}`}>
                                <ChevronDownIcon />
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedQuestions.has(idx) && (
                                <div className="px-6 pb-8 pt-0 animate-fade-in">
                                <div className="pl-[4.5rem]">
                                    
                                    {/* MCQ Options */}
                                    {q.type === QuestionType.MCQ && q.options && (
                                    <div className="space-y-3 mt-2 mb-6">
                                        {q.options.map((opt, optIdx) => {
                                        const isSelected = selectedOptions[idx] === optIdx;
                                        const isCorrect = q.correct_index === optIdx;
                                        const isLocked = selectedOptions[idx] !== undefined;
                                        const showResult = isSelected || (revealedAnswers.has(idx) && isCorrect);

                                        let btnClass = "relative w-full text-left p-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 group/opt overflow-hidden ";
                                        let circleClass = "w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-colors flex-shrink-0 ";

                                        if (showResult) {
                                            if (isCorrect) {
                                            btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
                                            circleClass += "bg-emerald-500 border-emerald-500 text-white";
                                            } else {
                                            btnClass += "bg-rose-50 border-rose-500 text-rose-900";
                                            circleClass += "bg-rose-500 border-rose-500 text-white";
                                            }
                                        } else {
                                            if (isLocked) {
                                            // Locked but not selected/active result
                                            btnClass += "bg-slate-50 border-transparent text-slate-400 opacity-60 cursor-not-allowed";
                                            circleClass += "bg-slate-200 border-transparent text-slate-400";
                                            } else {
                                            // Default State
                                            btnClass += "bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 hover:shadow-sm";
                                            circleClass += "bg-slate-100 border-transparent text-slate-500 group-hover/opt:bg-indigo-100 group-hover/opt:text-indigo-600";
                                            }
                                        }

                                        return (
                                            <button 
                                            key={optIdx}
                                            onClick={() => handleOptionSelect(idx, optIdx)}
                                            disabled={isLocked}
                                            className={btnClass}
                                            >
                                                <span className={circleClass}>
                                                    {String.fromCharCode(65 + optIdx)}
                                                </span>
                                                <span className="font-medium leading-snug">{opt}</span>
                                                
                                                {/* Result Status Icon */}
                                                {showResult && (
                                                    <div className="ml-auto flex-shrink-0">
                                                        {isCorrect ? (
                                                            <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-rose-100 text-rose-600 p-1 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                        })}
                                    </div>
                                    )}

                                    {/* Short Answer & Analytical Input */}
                                    {(q.type === QuestionType.ShortAnswer || q.type === QuestionType.Analytical) && (
                                        <div className="mb-6">
                                            <textarea
                                                value={userAnswers[idx] || ''}
                                                onChange={(e) => handleShortAnswerChange(idx, e.target.value)}
                                                placeholder={q.type === QuestionType.Analytical ? "Type your analysis here..." : "Type your answer here..."}
                                                disabled={revealedAnswers.has(idx)}
                                                className={`w-full p-4 rounded-xl border bg-white focus:ring-2 transition-all resize-none
                                                    ${revealedAnswers.has(idx) 
                                                        ? (q.type === QuestionType.ShortAnswer 
                                                            ? (validationResults[idx] === 'correct' ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900' : 'border-rose-200 bg-rose-50/30 text-rose-900')
                                                            : 'border-indigo-200 bg-indigo-50/30 text-indigo-900' // Analytical revealed style
                                                        )
                                                        : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-100 text-slate-700'
                                                    }`}
                                                rows={4}
                                            />
                                            {revealedAnswers.has(idx) && q.type === QuestionType.ShortAnswer && (
                                                <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${validationResults[idx] === 'correct' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                    {validationResults[idx] === 'correct' ? (
                                                        <><CheckCircleIcon className="h-5 w-5" /> Excellent! Your answer captures the key points.</>
                                                    ) : (
                                                        <><XIcon className="h-5 w-5" /> Not quite. Compare with the model answer below.</>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Answer Reveal Section */}
                                    <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                                    {!revealedAnswers.has(idx) ? (
                                        <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            if (q.type === QuestionType.ShortAnswer) {
                                                validateShortAnswer(idx, q.answer);
                                            } else {
                                                toggleAnswer(idx); 
                                            }
                                        }}
                                        className={`group flex items-center gap-2 text-sm font-semibold transition-colors px-4 py-2 rounded-lg 
                                            ${(q.type === QuestionType.ShortAnswer || q.type === QuestionType.Analytical) && !userAnswers[idx]?.trim() 
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'}`}
                                        disabled={(q.type === QuestionType.ShortAnswer || q.type === QuestionType.Analytical) && !userAnswers[idx]?.trim()}
                                        >
                                        <span>
                                            {q.type === QuestionType.ShortAnswer ? 'Check Answer' : 
                                            q.type === QuestionType.Analytical ? 'Submit & Reveal' : 
                                            'Reveal Answer & Source'}
                                        </span>
                                        <div className="w-4 h-4 rounded-full bg-indigo-200 flex items-center justify-center group-hover:bg-indigo-300 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                        </button>
                                    ) : (
                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-4 animate-fade-in-down">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Model Answer</h4>
                                            <p className="text-slate-800 font-medium leading-relaxed">{q.answer}</p>
                                        </div>
                                        
                                        {q.points_to_consider && (
                                            <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Analysis Points</h4>
                                            <ul className="space-y-2">
                                                {q.points_to_consider.map((pt, i) => (
                                                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                                                        {pt}
                                                    </li>
                                                ))}
                                            </ul>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2">
                                            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source</span>
                                            <p className="text-indigo-600 text-xs font-medium flex items-center gap-1">
                                                {q.source_location}
                                            </p>
                                        </div>
                                        
                                        <div className="pt-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleAnswer(idx); }}
                                                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                Hide Details
                                            </button>
                                        </div>
                                        </div>
                                    )}
                                    </div>

                                </div>
                                </div>
                            )}
                            </div>
                        );
                      });
                  })()}
                 </div>

                 {/* Questions Page Actions */}
                 <div className="flex flex-col items-center gap-4 pt-8">
                     
                     <div className="flex gap-3">
                         {view === 'questions' && (
                             <button 
                                onClick={handleGenerateMore}
                                className="group px-6 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all flex items-center gap-2"
                             >
                                <PlusIcon />
                                For More Questions
                             </button>
                         )}

                         <button 
                            onClick={handleViewResults}
                            className="group px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                         >
                            <ChartBarIcon />
                            View Results
                         </button>
                     </div>

                     <button 
                        onClick={resetSession}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-2"
                      >
                        <RefreshIcon />
                        Start New Session
                      </button>
                 </div>
              </div>
           </div>
        )}

        {/* VIEW: RESULTS PAGE */}
        {view === 'results' && (
            <div className="animate-fade-in space-y-8">
                {(() => {
                    // Combine all questions for the final score
                    const allQuestions = [...(result?.questions || []), ...extraQuestions];
                    const { percentage, correct, total } = calculateScore(allQuestions);
                    let feedback = "";
                    let colorClass = "";
                    
                    if (percentage >= 80) {
                        feedback = "Excellent Mastery! You have a strong grasp of this material.";
                        colorClass = "text-emerald-600";
                    } else if (percentage >= 50) {
                        feedback = "Good Understanding. Review the missed concepts to strengthen your knowledge.";
                        colorClass = "text-amber-600";
                    } else {
                        feedback = "Needs Review. Consider re-reading the summary and source text.";
                        colorClass = "text-rose-600";
                    }

                    // Identify incorrect questions for mistake analysis
                    const incorrectIndices = allQuestions.map((q, idx) => {
                        let isIncorrect = false;
                        if (q.type === QuestionType.MCQ) {
                            if (selectedOptions[idx] !== undefined && selectedOptions[idx] !== q.correct_index) {
                                isIncorrect = true;
                            }
                        } else if (q.type === QuestionType.ShortAnswer) {
                            if (validationResults[idx] === 'incorrect') {
                                isIncorrect = true;
                            }
                        }
                        return isIncorrect ? idx : -1;
                    }).filter(idx => idx !== -1);


                    return (
                        <>
                             {/* Score Header */}
                             <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-white">
                                <div className="p-10 flex flex-col items-center text-center space-y-6">
                                    <h3 className="text-2xl font-serif font-bold text-slate-800">Total Learning Performance</h3>
                                    
                                    <div className="relative w-48 h-48 flex items-center justify-center">
                                        <div className="absolute inset-0 rounded-full border-[12px] border-slate-100"></div>
                                        <div className={`absolute inset-0 rounded-full border-[12px] ${percentage >= 80 ? 'border-emerald-500' : percentage >= 50 ? 'border-amber-500' : 'border-rose-500'} border-r-transparent border-b-transparent transform -rotate-45`} style={{ clipPath: 'circle(100%)' }}></div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-5xl font-bold text-slate-900">{percentage}%</span>
                                            <span className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Accuracy</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className={`text-lg font-bold ${colorClass}`}>{feedback}</p>
                                        <p className="text-slate-500">You answered <span className="font-bold text-slate-800">{correct}</span> out of <span className="font-bold text-slate-800">{total}</span> auto-graded questions correctly.</p>
                                    </div>
                                </div>
                             </div>

                             {/* Mistake Analysis Section */}
                             {incorrectIndices.length > 0 && (
                                 <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 md:p-8 space-y-6">
                                     <div className="flex items-center gap-3 border-b border-rose-200/50 pb-4">
                                         <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                                            <LightBulbIcon className="h-6 w-6" />
                                         </div>
                                         <h3 className="text-xl font-serif font-bold text-rose-800">Areas for Improvement</h3>
                                     </div>
                                     <div className="space-y-6">
                                         {incorrectIndices.map(idx => {
                                             const q = allQuestions[idx];
                                             return (
                                                 <div key={idx} className="bg-white p-5 rounded-xl border border-rose-100 shadow-sm">
                                                     <div className="flex items-center gap-2 mb-2">
                                                         <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-50 px-1.5 rounded border border-rose-100">
                                                             Mistake in Q{idx + 1}
                                                         </span>
                                                     </div>
                                                     <p className="text-lg font-medium text-slate-800 mb-3">{q.question}</p>
                                                     
                                                     <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                         {/* User's Answer */}
                                                         <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                                                             <span className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-1">You Answered</span>
                                                             {q.type === QuestionType.MCQ ? (
                                                                 <p className="text-rose-700 font-medium">
                                                                     {q.options?.[selectedOptions[idx]]}
                                                                 </p>
                                                             ) : (
                                                                 <p className="text-rose-700 font-medium italic">
                                                                     "{userAnswers[idx]}"
                                                                 </p>
                                                             )}
                                                         </div>

                                                         {/* Correct Answer / Concept */}
                                                         <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                                             <span className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Correct Concept</span>
                                                             <p className="text-emerald-800 font-medium">
                                                                 {q.answer}
                                                             </p>
                                                         </div>
                                                     </div>
                                                     <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                                         <span className="font-semibold">Review Source:</span> {q.source_location}
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 </div>
                             )}

                             {/* Breakdown */}
                             <div className="space-y-4">
                                <h4 className="text-lg font-bold text-slate-700 px-2">Detailed Breakdown ({allQuestions.length} Questions)</h4>
                                {allQuestions.map((q, idx) => {
                                    let status: 'correct' | 'incorrect' | 'skipped' | 'manual' = 'skipped';
                                    
                                    if (q.type === QuestionType.MCQ) {
                                        if (selectedOptions[idx] !== undefined) {
                                            status = selectedOptions[idx] === q.correct_index ? 'correct' : 'incorrect';
                                        }
                                    } else if (q.type === QuestionType.ShortAnswer) {
                                        if (validationResults[idx]) {
                                            status = validationResults[idx];
                                        }
                                    } else {
                                        status = 'manual';
                                    }

                                    return (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-100 flex items-start gap-4 shadow-sm">
                                            <div className="flex-shrink-0 mt-1">
                                                {status === 'correct' && <div className="p-1 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircleIcon /></div>}
                                                {status === 'incorrect' && <div className="p-1 bg-rose-100 text-rose-600 rounded-full"><XIcon /></div>}
                                                {status === 'skipped' && <div className="p-1 bg-slate-100 text-slate-400 rounded-full"><div className="w-5 h-5 flex items-center justify-center font-bold">-</div></div>}
                                                {status === 'manual' && <div className="p-1 bg-indigo-100 text-indigo-600 rounded-full"><div className="w-5 h-5 flex items-center justify-center font-bold">A</div></div>}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-1.5 rounded">
                                                         Q{idx + 1}
                                                     </span>
                                                     {idx >= (result?.questions.length || 0) && (
                                                         <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-50 px-1.5 rounded">
                                                             Bonus
                                                         </span>
                                                     )}
                                                </div>
                                                <p className="text-slate-800 font-medium">{q.question}</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {status === 'correct' ? 'Correctly answered.' : 
                                                     status === 'incorrect' ? 'Incorrect answer selected.' :
                                                     status === 'manual' ? 'Analytical question (self-evaluated).' :
                                                     'Not answered.'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>

                             <div className="flex flex-col items-center gap-4 pt-8">
                                <button 
                                    onClick={() => setView(previousQuestionsView)}
                                    className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeftIcon />
                                    Back to Questions
                                </button>
                                <button 
                                    onClick={resetSession}
                                    className="px-6 py-3 rounded-xl border border-transparent text-slate-500 font-semibold hover:text-slate-800 transition-all flex items-center gap-2"
                                >
                                    <RefreshIcon />
                                    Start New Session
                                </button>
                             </div>
                        </>
                    );
                })()}
            </div>
        )}
      </main>

      <footer className="text-center py-10 text-slate-400 text-sm relative z-10">
        <p>© 2025 ScholarGen. Built by code atti.</p>
      </footer>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s infinite linear;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;