declare module 'stats-js' {
    export default class Stats {
        setMode(id: number): void;
        domElement: HTMLDivElement;
        begin(): void;
        end(): Date;
    }
}
