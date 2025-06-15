'use client'

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Monaco } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const CATEGORIES = [
  'strings',
  'arrays',
  'sets',
  'hashmaps',
  'two pointer',
  'stacks',
  'linked list',
  'search',
  'sliding window',
  'trees',
  'heap',
  'graphs',
  'dynamic programming'
]

const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

interface Question {
  id: string
  title: string
  content: string
  category: string
  solution: string
  source_link: string | null
  difficulty: string | null
  tags: string[]
  created_at: Date
  updated_at: Date
}

interface QuestionViewerProps {
  question: Question
  userId: string // Add userId prop
}

export default function QuestionViewer({ question, userId }: QuestionViewerProps) {
  const [title, setTitle] = useState(question.title)
  const [content, setContent] = useState(question.content)
  const [category, setCategory] = useState(question.category)
  const [difficulty, setDifficulty] = useState(question.difficulty || 'Easy')
  const [solution, setSolution] = useState(question.solution)
  const [sourceLink, setSourceLink] = useState(question.source_link || '')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleEditorDidMount = (
    editor: Parameters<NonNullable<React.ComponentProps<typeof MonacoEditor>['onMount']>>[0], 
    monaco: Monaco
  ) => {
    // Define the custom theme
    monaco.editor.defineTheme('customPythonDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', foreground: 'ffffff' }, // default text (others)
        { token: 'keyword', foreground: '427EB8' }, // other keywords
        { token: 'identifier', foreground: '91D6C8' }, // identifiers/variables
        { token: 'number', foreground: 'DCDCAA' },
        { token: 'string', foreground: '98C379' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editorLineNumber.foreground': '#5A5A5A',
        'editorIndentGuide.background': '#3C3C3C',
        'editor.selectionBackground': '#264F78',
        'editorCursor.foreground': '#FFFFFF',
      },
    })

    // Apply the theme
    monaco.editor.setTheme('customPythonDark')
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess('')
    setError('')

    try {
      const response = await fetch('/api/update-solution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          title: title,
          content: content,
          category: category,
          difficulty: difficulty,
          solution: solution,
          sourceLink: sourceLink
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSaveSuccess('Question updated successfully!')
        setIsEditing(false)
        setTimeout(() => setSaveSuccess(''), 3000)
      } else {
        setError(data.message || 'Failed to update question')
      }
    } catch (err) {
      setError(`An error occurred while saving: ${err}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/delete-question', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          userId: userId
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to home after successful deletion
        router.push('/home')
      } else {
        setError(data.message || 'Failed to delete question')
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError(`An error occurred while deleting: ${err}`)
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    // Reset all values to original
    setTitle(question.title)
    setContent(question.content)
    setCategory(question.category)
    setDifficulty(question.difficulty || 'Easy')
    setSolution(question.solution)
    setSourceLink(question.source_link || '')
    setIsEditing(false)
    setError('')
    setSaveSuccess('')
  }

  const formatProblemContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Handle different types of content
      if (line.startsWith('**') && line.endsWith('**')) {
        // Bold headers
        return (
          <h3 key={index} className="text-lg font-semibold text-white mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </h3>
        )
      } else if (line.startsWith('```') || line.trim() === '') {
        // Code blocks or empty lines
        return <div key={index} className="mb-2"></div>
      } else {
        // Process line for inline formatting
        const formattedLine = formatInlineText(line)
        return (
          <p key={index} className="text-gray-300 mb-2 leading-relaxed">
            {formattedLine}
          </p>
        )
      }
    })
  }

  const formatInlineText = (text: string) => {
    const parts: (string | JSX.Element)[] = []
    let currentIndex = 0
    
    // Process the text to handle ** ** and ` ` formatting
    while (currentIndex < text.length) {
      // Look for bold text (**text**)
      const boldStart = text.indexOf('**', currentIndex)
      const codeStart = text.indexOf('`', currentIndex)
      
      // Determine which comes first
      let nextSpecial = -1
      let type = ''
      
      if (boldStart !== -1 && (codeStart === -1 || boldStart < codeStart)) {
        nextSpecial = boldStart
        type = 'bold'
      } else if (codeStart !== -1) {
        nextSpecial = codeStart
        type = 'code'
      }
      
      if (nextSpecial === -1) {
        // No more special formatting, add remaining text
        if (currentIndex < text.length) {
          parts.push(text.substring(currentIndex))
        }
        break
      }
      
      // Add text before the special character
      if (nextSpecial > currentIndex) {
        parts.push(text.substring(currentIndex, nextSpecial))
      }
      
      if (type === 'bold') {
        // Find closing **
        const boldEnd = text.indexOf('**', nextSpecial + 2)
        if (boldEnd !== -1) {
          const boldText = text.substring(nextSpecial + 2, boldEnd)
          parts.push(<strong key={`bold-${nextSpecial}`} className="text-white font-semibold">{boldText}</strong>)
          currentIndex = boldEnd + 2
        } else {
          parts.push('**')
          currentIndex = nextSpecial + 2
        }
      } else if (type === 'code') {
        // Find closing `
        const codeEnd = text.indexOf('`', nextSpecial + 1)
        if (codeEnd !== -1) {
          const codeText = text.substring(nextSpecial + 1, codeEnd)
          parts.push(
            <code key={`code-${nextSpecial}`} className="bg-neutral-800 text-purple-400 px-1 py-0.5 rounded text-sm font-mono">
              {codeText}
            </code>
          )
          currentIndex = codeEnd + 1
        } else {
          parts.push('`')
          currentIndex = nextSpecial + 1
        }
      }
    }
    
    return parts
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return 'text-gray-400 bg-gray-900/20'
    
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-900/20'
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'hard':
        return 'text-red-400 bg-red-900/20'
      default:
        return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header with back button */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800 flex-shrink-0">
        <button
          onClick={() => router.push('/home')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to Home
        </button>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-700 transition-colors text-sm cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-500/20 rounded-md hover:bg-red-900/40 transition-colors text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Delete Question</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {(error || saveSuccess) && (
        <div className="px-4 py-2">
          {error && (
            <div className="p-3 border border-red-500 text-red-400 rounded-md bg-red-950/20 text-sm">
              {error}
            </div>
          )}
          {saveSuccess && (
            <div className="p-3 border border-green-500 text-green-400 rounded-md bg-green-950/20 text-sm">
              {saveSuccess}
            </div>
          )}
        </div>
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 flex gap-6 p-6 min-h-0">
        {/* Left Side - Problem */}
        <div className="flex-1 bg-neutral-900 rounded-lg shadow-md p-6 flex flex-col min-h-0">
          <div className="flex items-start justify-between mb-6 flex-shrink-0">
            <div className="flex-1">
              {/* Editable Title */}
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold text-white mb-4 bg-neutral-800 border border-neutral-600 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Question title"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white mb-2">
                  {sourceLink ? (
                    <a 
                      href={sourceLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h1>
              )}

              {/* Editable Source Link */}
              {isEditing && (
                <input
                  type="url"
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  className="text-sm text-gray-300 mb-4 bg-neutral-800 border border-neutral-600 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  placeholder="Source link (optional)"
                />
              )}

              <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className='flex gap-5'>
                  {/* Editable Difficulty */}
                  {isEditing ? (
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="px-3 py-1 rounded-full text-sm font-medium bg-neutral-800 text-white border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent cursor-pointer"
                    >
                      {DIFFICULTIES.map((diff) => (
                        <option key={diff} value={diff} className="bg-neutral-800 text-white">
                          {diff}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(difficulty)}`}>
                      {difficulty || 'Unknown'}
                    </span>
                  )}

                  {/* Editable Category */}
                  {isEditing ? (
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="appearance-none bg-neutral-800 text-white px-3 py-1 rounded-full text-sm font-medium border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent cursor-pointer pr-8"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-neutral-800 text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <span className="px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full text-sm font-medium">
                      {category}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  Added {formatDate(question.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto minimal-scrollbar">
            {isEditing ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full bg-neutral-800 text-gray-300 border border-neutral-600 rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent resize-none font-mono text-sm leading-relaxed"
                placeholder="Enter problem description..."
              />
            ) : (
              <div className="prose prose-invert max-w-none px-4">
                <div className="text-gray-300 leading-relaxed">
                  {formatProblemContent(content)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Code Editor */}
        <div className="flex-1 bg-neutral-900 rounded-lg shadow-md p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-xl font-semibold text-white">Solution</h2>
            {!isEditing && (
              <span className="text-sm text-gray-400">
                Read-only mode
              </span>
            )}
          </div>
          
          <div className="flex-1 relative min-h-0">
            <MonacoEditor
              height="100%"
              defaultLanguage="python"
              theme="customPythonDark"
              value={solution}
              onChange={(value) => setSolution(value || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                fontFamily: 'monospace',
                minimap: { enabled: false },
                wordWrap: 'off',
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                automaticLayout: true,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                readOnly: !isEditing,
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .minimal-scrollbar {
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #525252 transparent; /* Firefox */
        }
        .minimal-scrollbar::-webkit-scrollbar {
          width: 6px; /* Chrome, Safari, Edge */
        }
        .minimal-scrollbar::-webkit-scrollbar-track {
          background: transparent; /* No track background */
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #525252; /* Gray-600 */
          border-radius: 3px;
          border: none;
        }
        .minimal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #737373; /* Gray-500 on hover */
        }
        /* Remove scrollbar corners and buttons */
        .minimal-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
        }
        .minimal-scrollbar::-webkit-scrollbar-button {
          display: none;
        }
      `}</style>
    </div>
  )
}