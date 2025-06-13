'use client'

import { JSX, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Monaco } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Declare Prism for TypeScript
declare global {
  interface Window {
    Prism?: {
      highlightAll: () => void
    }
  }
}

interface ProblemData {
  title: string
  content: string
  difficulty: string
}

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

export default function ProblemExtractor() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [problem, setProblem] = useState<ProblemData | null>(null)
  const [error, setError] = useState('')
  const [solution, setSolution] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('arrays')
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

  const extractProblem = async () => {
    if (!url.trim()) {
      setError('Please enter a LeetCode problem URL')
      return
    }

    setLoading(true)
    setError('')
    setProblem(null)

    try {
      const response = await fetch('/api/extract-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (response.ok) {
        // Filter content to stop at constraints
        const filteredContent = filterContentTillExamples(data.problem.content)
        setProblem({
          ...data.problem,
          content: filteredContent
        })
      } else {
        setError(data.message || 'Failed to extract problem')
      }
    } catch (err) {
      setError(`An error occurred while extracting the problem: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const filterContentTillExamples = (content: string): string => {
    // Split content by lines and filter out constraints section
    const lines = content.split('\n')
    const filteredLines = []
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim()
      // Stop at constraints or follow-up sections
      if (lowerLine.startsWith('**constraints') || 
          lowerLine.startsWith('constraints') || 
          lowerLine.startsWith('**follow-up')) {
        break
      }
      filteredLines.push(line)
    }
    
    return filteredLines.join('\n').trim()
  }

  const handleCancel = () => {
    router.push('/home')
  }

  const handleSave = () => {
    // Save functionality will be implemented later
    console.log('Save clicked - functionality to be implemented')
    console.log('Selected category:', selectedCategory)
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

  // Show extraction interface if no problem is loaded
  if (!problem) {
    return (
      <div className="space-y-6 w-2xl">
        <div className="bg-neutral-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">LeetCode Problem URL</h2>
          
          <div className="space-y-4">
            <div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/problem-name"
                className="w-full px-4 py-3 border border-neutral-400 rounded-md shadow-sm bg-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
            
            <button
              onClick={extractProblem}
              disabled={loading}
              className="w-full bg-white text-black py-3 px-4 rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:opacity-50 transition-colors font-medium cursor-pointer"
            >
              {loading ? 'Extracting...' : 'Extract Problem'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 border border-red-500 text-red-400 rounded-md bg-red-950/20">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show split-screen layout once problem is extracted
  return (
    <div className="h-screen flex flex-col">
      {/* Problem and Solution Split View */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Side - Problem */}
        <div className="flex-1 bg-neutral-900 rounded-lg shadow-md p-6 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
            <div className="flex items-center gap-3">
              {/* Difficulty Badge */}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                'bg-red-900 text-red-300'
              }`}>
                {problem.difficulty}
              </span>
              
              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-neutral-800 text-white px-3 py-1 rounded-full text-sm font-medium border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent cursor-pointer pr-8"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category} className="bg-neutral-800 text-white">
                      {category}
                    </option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed">
                {formatProblemContent(problem.content)}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Code Editor */}
        <div className="flex-1 bg-neutral-900 rounded-lg shadow-md p-6 flex flex-col min-h-0">
          <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">Python Solution</h2>
          
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
                wordWrap: 'off',              // Disable word wrapping for smooth scroll
                scrollBeyondLastLine: false, // Prevent huge extra space at bottom
                smoothScrolling: true,       // Enable smooth scroll
                automaticLayout: true,       // Resize editor automatically
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                },
                lineNumbers: 'on',
                renderLineHighlight: 'line',
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end gap-4 mt-6 flex-shrink-0">
        <button
          onClick={handleCancel}
          className="px-6 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-white text-black rounded-md hover:bg-neutral-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}