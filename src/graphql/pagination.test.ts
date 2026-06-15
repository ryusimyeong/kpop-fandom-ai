import { describe, it, expect } from 'vitest';
import { encodeCursor, decodeCursor, toConnection } from './pagination';

describe('cursor encode/decode (opaque)', () => {
  it('encode→decode 라운드트립이 원래 id를 복원한다', () => {
    const id = 'a1';
    const cursor = encodeCursor(id);
    // 불투명해야 한다: 원본 id가 그대로 노출되면 안 됨.
    expect(cursor).not.toBe(id);
    expect(decodeCursor(cursor)).toBe(id);
  });

  it('잘못된 cursor는 null로 디코딩된다', () => {
    expect(decodeCursor('not-a-real-cursor!!')).toBeNull();
    // base64지만 prefix가 없는 경우
    expect(decodeCursor(Buffer.from('nope', 'utf8').toString('base64'))).toBeNull();
  });
});

describe('toConnection (hasNextPage / endCursor 계산)', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `id${i + 1}` }));

  it('first보다 한 개 더 넘어오면 hasNextPage=true이고 여분은 잘라낸다', () => {
    // 호출부는 first+1개를 조회해 넘긴다. 여기선 first=2에 3개를 준다.
    const conn = toConnection(rows(3), 2);
    expect(conn.edges).toHaveLength(2);
    expect(conn.pageInfo.hasNextPage).toBe(true);
    expect(conn.pageInfo.endCursor).toBe(encodeCursor('id2'));
  });

  it('first 이하면 hasNextPage=false', () => {
    const conn = toConnection(rows(2), 2);
    expect(conn.edges).toHaveLength(2);
    expect(conn.pageInfo.hasNextPage).toBe(false);
    expect(conn.pageInfo.endCursor).toBe(encodeCursor('id2'));
  });

  it('빈 결과면 endCursor=null, hasNextPage=false', () => {
    const conn = toConnection(rows(0), 10);
    expect(conn.edges).toHaveLength(0);
    expect(conn.pageInfo.hasNextPage).toBe(false);
    expect(conn.pageInfo.endCursor).toBeNull();
  });

  it('각 edge의 cursor는 해당 node id로부터 인코딩된다', () => {
    const conn = toConnection(rows(2), 5);
    expect(conn.edges[0].cursor).toBe(encodeCursor('id1'));
    expect(conn.edges[1].cursor).toBe(encodeCursor('id2'));
  });
});
