import { ApiError, apiFetch } from 'api/client';
import { vi } from 'vitest';

describe('apiFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on 200', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify([{ id: 'x' }]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const data = await apiFetch<Array<{ id: string }>>('/projects');
    expect(data).toEqual([{ id: 'x' }]);
  });

  it('throws ApiError with status on non-2xx', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response('nope', { status: 500 }),
    );

    await expect(apiFetch('/projects')).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch('/projects')).rejects.toMatchObject({ status: 500 });
  });
});
