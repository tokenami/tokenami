// support turbopack and webpack
declare module '*.svg' {
  const content: string | { src: string; height: number; width: number };
  export default content;
}
