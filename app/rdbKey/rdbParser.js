// import fs from "fs";

function getKeyValues(data) {
  let cursor = 9;
  const keys = [];
  while (cursor < data.length) {
    const marker = data.readUInt8(cursor);
    cursor++;

    if (marker === 0xfe) {
      //start of the database
      const [size, nextCursor] = parseSizeEncoding(data, cursor);
      cursor = nextCursor;
    } else if (marker === 0xfb) {
      //hash table size info
      const [size, nextCursor] = parseSizeEncoding(data, cursor);
      cursor = nextCursor + 2;
    } else if (marker === 0x00) {
      const [size, nextCursor] = parseSizeEncoding(data, cursor);
      const key = data.slice(nextCursor, nextCursor + size).toString("ascii");
      nextCursor = nextCursor + size;

      const [valueSize, valueNextCursor] = parseSizeEncoding(data, cursor);
      const value = data
        .slice(valueNextCursor, valueNextCursor + valueSize)
        .toString("ascii");
      nextCursor = valueNextCursor + valueSize;

      keys.push(key);
    } else if (marker === 0xff) {
      // End of file
      break;
    } else {
      throw new Error(`Unexpected marker ${marker}`);
    }
  }
  return keys;
}

function parseSizeEncoding(buffer, cursor) {
  const byte = buffer.readUInt8(cursor);
  if (byte >> 6 === 0b00) {
    return [byte & 0x3f, cursor + 1];
  } else if (byte >> 6 === 0b01) {
    return [((byte & 0x3f) << 8) | buffer.readUInt8(cursor + 1), cursor + 2];
  } else if (byte >> 6 === 0b10) {
    return [buffer.readUInt32(offset + 1), cursor + 5];
  } else throw new Error("Unsupported encoding");
}

module.exports = { getKeyValues };
