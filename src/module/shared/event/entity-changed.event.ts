export class EntityChangedEvent<T> {
  constructor(
    public readonly operationType: string,
    public readonly entityId: string,
    public readonly entityData: T
  ) {}
}
