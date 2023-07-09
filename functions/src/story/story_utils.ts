const styles : string[] = [
  "the Arabian Nights",
  "Hans Christian Andersen",
  "the Brothers Grimm",
  "Charles Perrault",
];

const durations : number[] = [2, 3, 4, 5]

export function getRandomStyle(): string {
    return styles[Math.floor(Math.random() * styles.length)];
}

export function getRandomDuration(): number {
    return durations[Math.floor(Math.random() * styles.length)];
}