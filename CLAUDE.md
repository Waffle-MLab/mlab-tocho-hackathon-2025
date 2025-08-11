# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hackathon project directory (mlab-tocho-hackathon-2025) that is currently being initialized. The project structure and technology stack are still being determined.

## Available Files

- `claude-code-instructions.md`: Japanese instructions for using Claude Code effectively

## Development Setup

### Installation
```bash
npm install
```

### Available Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking

## Architecture Notes

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Map Integration**: OpenStreetMap (planned)
- **Database**: Supabase (planned)
- **Styling**: CSS modules
- **Linting**: ESLint + Prettier

### Project Structure
```
src/
  components/     # Reusable UI components
  hooks/          # Custom React hooks
  types/          # TypeScript type definitions
  utils/          # Utility functions
  App.tsx         # Main app component
  main.tsx        # Entry point
public/           # Static assets
```

## Language Preference

Based on the existing instruction file, this project may involve Japanese language development or documentation.

## アプリケーション仕様

  ### アプリ概要
  - **アプリ名**: なら枯れ、松枯れ、情報共有 Web地図アプリ
  - **目的**: 行政間の植物の感染症の情報共有を行う地図アプリ
  - **ターゲットユーザー**: 植物園の植物の管理者

  ### 主要機能
  1. オープンストリートマップを用いた地図の表示
  2. csvで用意された木の点を地図上に描画
  3. 年代ごとに、なら枯れ、松枯れ、の木を目立つようにできるし、エリアを自動で囲む
  4. 木ごとにチャットができる

  ### 技術スタック
  - **フロントエンド**: [React]
  - **バックエンド**: [Node.js]
  - **データベース**: [supabase]
  - **その他**: [open street map]

  ### UI/UX要件
  - **デザインスタイル**: [モダン]
  - **レスポンシブ対応**: [必要]
  - **アクセシビリティ**: [考慮事項]

  ### データ構造
  - **主要エンティティ**: [User, Tree など]
  - **データ関係**: [おいおい考える]

  ### API設計
  ユーザー登録などがあるが、おいおい考える
  - **RESTful/GraphQL**: [選択した理由]
  - **主要エンドポイント**: [一覧]
  - **認証方式**: [JWT/OAuth など]

  ### セキュリティ要件
  おいおい考える
  - **認証・認可**: [要件]
  - **データ保護**: [個人情報の扱い]

  ### パフォーマンス要件
  地図の素早い描画が必要
  - **応答時間**: [目標値]
  - **同時接続数**: [想定値]

  ### デプロイメント
  無料で使える環境にあげる。githubPageでもいったんいい
  - **環境**: [本番・ステージング環境]
  - **CI/CD**: [自動デプロイの有無]
