var nextId = 0;

export class Prize {
  id: number;

  constructor(public name: string, public offer: string, public validUntil: string) {
    this.id = nextId++;
  }
}
