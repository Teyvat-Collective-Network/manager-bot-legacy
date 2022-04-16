import { recursive } from 'file-ez';
import { resolve } from 'path';

function filterMap<T,R>(array: T[], filter: (value: T, index: number, array: T[]) => R, that?: any): R[] {
  if (that) filter = filter.bind(that);
  let count = 0;
  const out: R[] = Array(array.length);
  
  for (let i = 0; i < array.length; i++) {
    const value = filter(array[i], i, array);
    if (value) out[count++] = value;
  }

  out.length = count;  
  return out;
}

export async function loader<T>(...dir: string[]): Promise<T[]> {
  const paths = await recursive(resolve(...dir));
  return filterMap(paths, path => ['js', 'ts'].some(ext => path.endsWith(ext)) && !path.endsWith('.d.ts') && require(path)?.default);
}