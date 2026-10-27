export type MidiErrorCode = 'invalid' | 'empty' | 'drumsOnly' | 'tooLarge';

export class MidiError extends Error {
  code: MidiErrorCode;
  constructor(code: MidiErrorCode) {
    super(code);
    this.code = code;
  }
}
