import { property, propertyArray } from "../jsonobject";
import { Base } from "../base";
import { IAction, Action, BaseAction } from "./action";
import { CssClassBuilder } from "../utils/cssClassBuilder";
import { ILocalizableOwner, LocalizableString } from ".././localizablestring";
import { mergeValues } from "../utils/utils";
import { debounce } from "../utils/taskmanager";

export type ActionBarCssClasses = { [index: string]: string };

export let defaultActionBarCss: ActionBarCssClasses = {
  root: "sv-action-bar",
  defaultSizeMode: "sv-action-bar--default-size-mode",
  smallSizeMode: "sv-action-bar--small-size-mode",
  item: "sv-action-bar-item",
  itemWithTitle: "",
  itemAsIcon: "sv-action-bar-item--icon",
  itemActive: "sv-action-bar-item--active",
  itemPressed: "sv-action-bar-item--pressed",
  itemIcon: "sv-action-bar-item__icon",
  itemTitle: "sv-action-bar-item__title",
  itemTitleWithIcon: "sv-action-bar-item__title--with-icon",
};

export type ContainerUpdateOptions = { needUpdateActions?: boolean, needUpdateIsEmpty?: boolean }

export class ActionContainer<T extends BaseAction = Action> extends Base implements ILocalizableOwner {
  private static ContainerID = 1;
  protected id = ActionContainer.ContainerID++;

  public getMarkdownHtml(text: string, name: string, item?: any): string {
    return !!this.locOwner ? this.locOwner.getMarkdownHtml(text, name, item) : undefined;
  }
  public getRenderer(name: string): string {
    return !!this.locOwner ? this.locOwner.getRenderer(name) : null;
  }
  public getRendererContext(locStr: LocalizableString): any {
    return !!this.locOwner ? this.locOwner.getRendererContext(locStr) : locStr;
  }
  public getProcessedText(text: string): string {
    return this.locOwner ? this.locOwner.getProcessedText(text) : text;
  }
  public getLocale(): string {
    return !!this.locOwner ? this.locOwner.getLocale() : "";
  }
  @propertyArray({}) visibleActions: Array<T> = [];
  @propertyArray({
    onSet: (_: any, target: ActionContainer<Action>) => {
      target.onSet();
    },
    onPush: (item: any, i: number, target: ActionContainer<Action>) => {
      target.onPush(item);
    },
    onRemove: (item: any, i: number, target: ActionContainer<Action>) => {
      target.onRemove(item);
    }
  })
    actions: Array<T>;
  private cssClassesValue: any;
  protected getRenderedActions(): Array<T> {
    return this.visibleActions;
  }

  @property({}) containerCss: string;
  public sizeMode: "default" | "small" = "default";
  public locOwner: ILocalizableOwner;
  @property({ defaultValue: true }) isEmpty: boolean;
  public locStrsChanged(): void {
    super.locStrsChanged();
    this.actions.forEach(item => {
      if (item.locTitle) item.locTitle.strChanged();
      item.locStrsChanged();
    });
  }

  public flushUpdates() {
    this.raiseUpdateCallback.flushSync();
  }
  protected raiseUpdate(options?: { needUpdateActions?: boolean, needUpdateIsEmpty?: boolean }) {
    const lastArguments = this.raiseUpdateCallback.getLastArguments();
    const lastOptions = ((lastArguments && lastArguments[0]) ?? {}) as ContainerUpdateOptions;
    this.raiseUpdateCallback.run(this.mergeUpdateOptions(options, lastOptions));
  }
  protected mergeUpdateOptions(nextOptions: ContainerUpdateOptions, prevOptions: ContainerUpdateOptions): ContainerUpdateOptions {
    const options = Object.assign({}, nextOptions);
    options.needUpdateActions = !!options.needUpdateActions || !!prevOptions.needUpdateActions;
    options.needUpdateIsEmpty = !!options.needUpdateIsEmpty || !!prevOptions.needUpdateIsEmpty;
    return options;
  }
  private raiseUpdateCallback = debounce((isResetInitialized) => {
    this.update(isResetInitialized);
  });
  protected update(options?: ContainerUpdateOptions) {
    if (options?.needUpdateActions) {
      this.updateVisibleActions();
    }
    if (options?.needUpdateIsEmpty) {
      this.updateIsEmpty();
    }
  }
  protected updateVisibleActions() {
    this.visibleActions = this.getVisibleActions();
  }
  private updateIsEmpty() {
    this.isEmpty = this.getIsEmpty();
  }
  protected getIsEmpty(): boolean {
    return this.visibleActions.length <= 0;
  }

  public getVisibleActions() {
    return this.actions.filter((action) => action.visible !== false);
  }

  protected onSet() {
    this.actions.forEach((action) => {
      this.patchAction(action);
    });
  }
  protected onPush(action: T) {
    this.patchAction(action);
    this.raiseUpdate({ needUpdateActions: true, needUpdateIsEmpty: true });
  }

  protected onRemove(action: T) {
    this.unPatchAction(action);
    this.raiseUpdate({ needUpdateActions: true, needUpdateIsEmpty: true });
  }

  protected onActionPropertyChanged(action: T, options: { name: string, newValue: any, oldValue: any }) {
    if (options.name == "_visible") {
      this.raiseUpdate({ needUpdateActions: true, needUpdateIsEmpty: true });
    }
  }
  protected onActionPropertyChangedCallback = this.onActionPropertyChanged.bind(this);
  protected patchAction(action: T) {
    this.setActionCssClasses(action);
    action.owner = this;
    action.onPropertyChanged.add(this.onActionPropertyChangedCallback);
  }
  protected unPatchAction(action: T) {
    action.owner = null;
    action.onPropertyChanged.remove(this.onActionPropertyChangedCallback);
  }

  private setActionCssClasses(item: T) {
    item.cssClasses = this.cssClasses;
  }

  public get hasActions(): boolean {
    return (this.actions || []).length > 0;
  }

  public get hasVisibleActions(): boolean {
    return !this.isEmpty;
  }

  public get renderedActions(): Array<T> {
    return this.getRenderedActions();
  }
  public getRootStyle() {
    return undefined;
  }
  public getRootCss(): string {
    const sizeModeClass = this.sizeMode === "small" ? this.cssClasses.smallSizeMode : this.cssClasses.defaultSizeMode;
    return new CssClassBuilder().append(this.cssClasses.root + (!!sizeModeClass ? " " + sizeModeClass : "") + (!!this.containerCss ? " " + this.containerCss : ""))
      .append(this.cssClasses.root + "--empty", this.isEmpty)
      .toString();
  }
  protected getDefaultCssClasses(): any {
    return defaultActionBarCss;
  }
  protected getAllActions() {
    return this.actions;
  }
  public setCssClasses(val: ActionBarCssClasses, mergeWithDefault: boolean = true) {
    this.cssClassesValue = {};
    if (mergeWithDefault) {
      this.copyCssClasses(this.cssClassesValue, this.getDefaultCssClasses());
    }
    mergeValues(val, this.cssClasses);
    this.getAllActions().forEach((action: T) => {
      this.setActionCssClasses(action);
    });
  }
  public set cssClasses(val: ActionBarCssClasses) {
    this.setCssClasses(val);
  }
  public get cssClasses(): ActionBarCssClasses {
    if (!this.cssClassesValue) {
      this.cssClassesValue = this.getDefaultCssClasses();
    }
    return this.cssClassesValue;
  }
  private createAction(item: IAction): T {
    return <T>(item instanceof BaseAction ? item : new Action(item));
  }
  public addAction(val: IAction, sortByVisibleIndex = true): T {
    const res: T = this.createAction(val);
    if (sortByVisibleIndex && !this.isActionVisible(res)) return res;
    const items = [].concat(this.actions, res);
    this.sortItems(items);
    this.actions = items;
    return res;
  }
  public setItems(items: Array<IAction>, sortByVisibleIndex = true): void {
    const newActions: Array<T> = [];
    items.forEach(item => {
      if (!sortByVisibleIndex || this.isActionVisible(item)) {
        newActions.push(this.createAction(item));
      }
    });
    if (sortByVisibleIndex) {
      this.sortItems(newActions);
    }
    this.actions = newActions;
  }
  private sortItems(items: Array<IAction>): void {
    if (this.hasSetVisibleIndex(items)) {
      items.sort(this.compareByVisibleIndex);
    }
  }
  private hasSetVisibleIndex(items: Array<IAction>): boolean {
    for (let i = 0; i < items.length; i ++) {
      const index = items[i].visibleIndex;
      if (index !== undefined && index >= 0) return true;
    }
    return false;
  }
  private compareByVisibleIndex(first: IAction, second: IAction): number {
    return first.visibleIndex - second.visibleIndex;
  }
  private isActionVisible(item: IAction): boolean {
    return item.visibleIndex >= 0 || item.visibleIndex === undefined;
  }
  @property({ defaultValue: 300 }) subItemsShowDelay: number;
  @property({ defaultValue: 300 }) subItemsHideDelay: number;
  protected popupAfterShowCallback(itemValue: T): void {

  }

  public mouseOverHandler(itemValue: T): void {
    itemValue.isHovered = true;
    let needToShowPopup = false;
    let otherPopupVisible = false;
    this.actions.forEach(action => {
      if (action === itemValue && !!itemValue.popupModel) {
        needToShowPopup = true;
      }
      if (action.popupModel && action.popupModel.isVisible) {
        otherPopupVisible = true;
      }
    });
    if (needToShowPopup) {
      const delay = otherPopupVisible ? Math.max(this.subItemsShowDelay, this.subItemsHideDelay) : this.subItemsShowDelay;
      itemValue.showPopupDelayed(delay);
      this.popupAfterShowCallback(itemValue);
    }
  }

  public initResponsivityManager(container: HTMLDivElement, delayedUpdateFunction?: (callback: () => void) => void): void {
    return;
  }
  public resetResponsivityManager(): void { }
  public getActionById(id: string): T {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].id === id) return this.actions[i];
    }
    return null;
  }
  public dispose(): void {
    super.dispose();
    this.resetResponsivityManager();
    this.actions.forEach(action => action.dispose());
    this.actions.length = 0;
  }
}
