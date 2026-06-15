/**
 * @file GraphQL 스키마 정의 (SDL).
 * 아티스트/앨범/팬덤 용어를 조회하는 Query와, AI 답변을 생성하는 Mutation을 노출.
 */
import gql from 'graphql-tag';

export const typeDefs = gql`
  type Album {
    id: ID!
    title: String!
    releaseYear: Int!
    trackCount: Int!
  }

  type Artist {
    id: ID!
    name: String!
    debutYear: Int!
    agency: String!
    bio: String!
    albums: [Album!]!
  }

  enum TermCategory {
    general
    event
    rank
    relationship
  }

  type FandomTerm {
    id: ID!
    term: String!
    romanized: String!
    category: TermCategory!
    meaning: String!
    example: String
  }

  """AI 챗봇 답변. sources에는 답변 근거로 사용한 아티스트/용어 id가 담긴다(RAG 추적성)."""
  type AskAnswer {
    question: String!
    answer: String!
    sources: [String!]!
  }

  "Relay 스타일 페이지 정보."
  type PageInfo {
    hasNextPage: Boolean!
    "다음 페이지 조회 시 after로 넘길 cursor(없으면 null)."
    endCursor: String
  }

  "Relay 스타일 edge: 노드 + 해당 노드의 opaque cursor."
  type ArtistEdge {
    node: Artist!
    cursor: String!
  }

  "Relay 스타일 아티스트 connection(cursor 기반 페이지네이션)."
  type ArtistConnection {
    edges: [ArtistEdge!]!
    pageInfo: PageInfo!
  }

  type Query {
    "전체 아티스트. search로 이름 부분일치 필터.(하위호환용 비페이지네이션 쿼리)"
    artists(search: String): [Artist!]!
    "cursor 기반 페이지네이션 아티스트 조회. first=페이지 크기, after=이전 페이지의 endCursor."
    artistsConnection(first: Int = 10, after: String): ArtistConnection!
    "단일 아티스트 조회."
    artist(id: ID!): Artist
    "팬덤 용어 사전. category로 필터, search로 용어/풀이 부분일치."
    terms(category: TermCategory, search: String): [FandomTerm!]!
  }

  type Mutation {
    "질문을 받아 보유 데이터를 근거로 AI 답변을 생성(RAG)."
    ask(question: String!): AskAnswer!
  }
`;
