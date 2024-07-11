//accept importing modules that are *.png files
declare module "*.png" {
  const content: any;
  export default content;
}

interface FormData {
  entries(): IterableIterator<[string, string | Blob]>;
}
