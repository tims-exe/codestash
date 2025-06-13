// src/app/api/extract-problem/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Enhanced HTML to text conversion function that preserves formatting
function htmlToText(html: string): string {
  return html
    .replace(/<\/p>/gi, '\n\n')           // Convert closing p tags to double newline
    .replace(/<br\s*\/?>/gi, '\n')        // Convert br tags to newline
    .replace(/<\/div>/gi, '\n')           // Convert closing div tags to newline
    .replace(/<\/li>/gi, '\n')            // Convert closing li tags to newline
    .replace(/<\/h[1-6]>/gi, '\n\n')      // Convert closing heading tags to double newline
    .replace(/<pre[^>]*>/gi, '\n```\n')   // Convert opening pre tags to code block
    .replace(/<\/pre>/gi, '\n```\n')      // Convert closing pre tags to code block
    .replace(/<code[^>]*>/gi, '`')        // Convert opening code tags to backtick
    .replace(/<\/code>/gi, '`')           // Convert closing code tags to backtick
    .replace(/<strong[^>]*>/gi, '**')     // Convert opening strong tags to markdown bold
    .replace(/<\/strong>/gi, '**')        // Convert closing strong tags to markdown bold
    .replace(/<b[^>]*>/gi, '**')          // Convert opening b tags to markdown bold
    .replace(/<\/b>/gi, '**')             // Convert closing b tags to markdown bold
    .replace(/<em[^>]*>/gi, '_')          // Convert opening em tags to markdown italic
    .replace(/<\/em>/gi, '_')             // Convert closing em tags to markdown italic
    .replace(/<i[^>]*>/gi, '_')           // Convert opening i tags to markdown italic
    .replace(/<\/i>/gi, '_')              // Convert closing i tags to markdown italic
    .replace(/<[^>]*>/g, '')              // Remove remaining HTML tags
    .replace(/&nbsp;/g, ' ')              // Replace &nbsp; with space
    .replace(/&lt;/g, '<')               // Replace &lt; with <
    .replace(/&gt;/g, '>')               // Replace &gt; with >
    .replace(/&amp;/g, '&')              // Replace &amp; with &
    .replace(/&quot;/g, '"')             // Replace &quot; with "
    .replace(/&#39;/g, "'")              // Replace &#39; with '
    .replace(/\n\s*\n\s*\n/g, '\n\n')    // Replace multiple consecutive newlines with double newline
    .replace(/[ \t]+/g, ' ')             // Replace multiple spaces/tabs with single space
    .trim()
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { message: 'URL is required' },
        { status: 400 }
      )
    }

    // Extract problem slug from URL and normalize it
    const match = url.match(/leetcode\.com\/problems\/([\w-]+)/)
    if (!match) {
      return NextResponse.json(
        { message: 'Invalid LeetCode problem URL. Please use format: https://leetcode.com/problems/problem-name/' },
        { status: 400 }
      )
    }

    const titleSlug = match[1]

    const query = {
      operationName: "questionData",
      variables: { titleSlug },
      query: `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            content
            difficulty
            topicTags {
              name
            }
          }
        }
      `,
    }

    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify(query),
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch problem from LeetCode' },
        { status: 500 }
      )
    }

    const json = await response.json()
    const question = json.data?.question

    if (!question) {
      return NextResponse.json(
        { message: 'Problem not found. Please check the URL and try again.' },
        { status: 404 }
      )
    }

    // Convert HTML content to plain text
    const plainText = htmlToText(question.content)

    const problemData = {
      title: question.title,
      content: plainText,
      difficulty: question.difficulty,
      tags: question.topicTags?.map((tag: { name: string }) => tag.name) || []
    }

    return NextResponse.json(
      { 
        message: 'Problem extracted successfully',
        problem: problemData
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Extract problem error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}