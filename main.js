const fileInput = document.getElementById("fileInput");

const CHUNK_SIZE = 1024 * 1024 * 5;

fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const chunks = await cutFile(file);
  await uploadChunks(chunks);
};

const cutFile = async (file) => {
  const chunkCount = Math.ceil(file.size / CHUNK_SIZE);
  const result = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunk = await createChunk(file, i, CHUNK_SIZE);
    result.push(chunk);
  }
  return result;
};

const createChunk = (file, index, chunkSize) => {
  return new Promise((resolve) => {
    const start = index * chunkSize;
    const end = start + chunkSize;
    const fileReader = new FileReader();
    const blob = file.slice(start, end);
    fileReader.onload = (e) => {
      resolve({
        start,
        end,
        index,
        blob,
      });
    };
    fileReader.readAsArrayBuffer(blob);
  });
};

const uploadChunks = async (chunks) => {
  for (const chunk of chunks) {
    await uploadChunk(chunk);
  }
};

const uploadChunk = async (chunk) => {
  try {
    const formData = new FormData();
    formData.append("file", chunk.blob);
    formData.append("start", chunk.start);
    formData.append("end", chunk.end);
    formData.append("index", chunk.index);

    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("上传块失败");
    }
  } catch (error) {
    console.log(error);
  }
};
