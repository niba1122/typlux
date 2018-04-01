export type ReadOnly<S> = {
  readonly [K in keyof S]: S[K]
}

class Lazy<T> {
  private value?: T
  private creator: () => T

  constructor(creator: () => T) {
    this.creator = creator
  }

  get(): T {
    if (this.value != undefined) {
      return this.value
    } else {
      let value = this.creator()
      this.value = value
      return value
    }
  }
}

interface Observable<T> {
  subscribe(callback: (value: T) => void): void
  unsubscribe(id: number): void
}

class Subject<T> implements Observable<T> {
  private callbacks: { [id: number]: (value: T) => void } = {}
  private lastId: number = 0

  subscribe(callback: (value: T) => void): number {
    let id = this.lastId + 1
    this.callbacks[id] = callback
    this.lastId = id
    return id
  }

  unsubscribe(id: number) {
    delete this.callbacks[id]
  }

  publish(value: T) {
    for (var id in this.callbacks) {
      if (this.callbacks.hasOwnProperty(id)) {
        this.callbacks[id](value)
      }
    }
  }
}

export interface ImmutableVariable<T> {
  readonly value: T
}

interface ImmutableObservableVariable<T> extends ImmutableVariable<T> {
  readonly value: T
  subscribe(callback: (value: T) => void): void
}

class ObservableVariable<T> implements ImmutableObservableVariable<T> {
  private currentValue: T
  private subject: Subject<T> = new Subject()

  constructor(initialValue: T) {
    this.currentValue = initialValue
    this.subject.subscribe((value) => {
      this.currentValue = value
    })
  }

  get value(): T {
    return this.currentValue
  }

  set value(value: T) {
    this.subject.publish(value)
  }

  subscribe(callback: (value: T) => void): number {
    callback(this.currentValue)
    return this.subject.subscribe(callback)
  }

  unsubscribe(id: number) {
    this.subject.unsubscribe(id)
  }
}

export abstract class ActionCreator<A, S> {
  protected abstract readonly dispatch: Dispatcher<A>
  protected abstract readonly state: ImmutableVariable<ReadOnly<S>>
}

export type Dispatcher<A> = (action: A) => void

export type Reducer<A, S> = (action: A, state: ReadOnly<S>) => S

export type Getter<S, VP> = (state: ReadOnly<S>) => VP

export type ViewPropertyObserver<VP> = (viewProperty: VP) => void

export default abstract class Store<AC extends ActionCreator<A, S>, A, S, VP> {
  protected abstract provideActionCreator(dispatch: Dispatcher<A>, state: ImmutableVariable<ReadOnly<S>>): AC
  protected abstract provideReducer(): Reducer<A, S>
  protected abstract provideGetter(): Getter<S, VP>
  protected abstract provideInitialState(): S

  private _actionCreator = new Lazy(() => this.provideActionCreator(this.dispatcher, this.state.get()))
  get actionCreator(): AC {
    return this._actionCreator.get()
  }
  private initialState = new Lazy(() => this.provideInitialState())
  private reducer = new Lazy(() => this.provideReducer())
  private getter = new Lazy(() => this.provideGetter())

  private action: Subject<A> = new Subject()
  private state: Lazy<ObservableVariable<S>> = new Lazy(() => new ObservableVariable(this.initialState.get()))
  private viewProperty: Lazy<ObservableVariable<VP>> = new Lazy(() => new ObservableVariable(this.getter.get()(this.state.get().value)))

  private actionSubscriptionID: number
  private stateSubscriptionID: Lazy<number> = new Lazy(() => this.state.get().subscribe((state) => {
    this.viewProperty.get().value = this.getter.get()(state)
  }))

  private dispatcher: Dispatcher<A> = (action: A) => {
    this.action.publish(action)
  }

  constructor() {
    this.actionSubscriptionID = this.action.subscribe((action) => {
      this.state.get().value = this.reducer.get()(action, this.state.get().value)
    })
  }

  subscribeViewProperty(callback: ViewPropertyObserver<ReadOnly<VP>>): number {
    // lazy subscription of state
    this.stateSubscriptionID.get()

    return this.viewProperty.get().subscribe((viewProperty) => {
      callback(viewProperty)
    })
  }

  unsubscribeViewProperty(id: number) {
    this.viewProperty.get().unsubscribe(id)
  }
}
