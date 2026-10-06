const namesInput = document.querySelector("#names");
const groupList = document.querySelector("#group-list");
const peopleCount = document.querySelector("#people-count");
const resultsMeta = document.querySelector("#results-meta");
const message = document.querySelector("#message");
const reshuffleButton = document.querySelector("#reshuffle");
const copyButton = document.querySelector("#copy-results");
let groups = [];

function readNames() {
  return namesInput.value
    .split(/[\n,;]+/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function updateCount() {
  const count = readNames().length;
  peopleCount.textContent = `${count} ${count === 1 ? "name" : "names"}`;
}

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeGroups() {
  message.textContent = "";
  const people = readNames();
  const uniquePeople = new Set(people.map((name) => name.toLocaleLowerCase()));
  if (people.length < 2) {
    message.textContent = "Add at least two names to make a group.";
    return;
  }
  if (uniquePeople.size !== people.length) {
    message.textContent =
      "There are duplicate names. Each person needs a unique name.";
    return;
  }

  const shuffledPeople = shuffle(people);
  groups = [];
  for (let index = 0; index < shuffledPeople.length; index += 2) {
    groups.push(shuffledPeople.slice(index, index + 2));
  }
  renderGroups();
}

function movePerson(groupIndex, direction) {
  const source = groups[groupIndex];
  if (direction === "add") {
    const donor = groups
      .map((group, index) => ({ group, index }))
      .filter(({ group, index }) => index !== groupIndex && group.length > 1)
      .sort((left, right) => right.group.length - left.group.length)[0];
    if (!donor) return;
    source.push(donor.group.pop());
    if (donor.group.length === 0) groups.splice(donor.index, 1);
  } else {
    if (source.length < 2) return;
    const [person] = source.splice(
      Math.floor(Math.random() * source.length),
      1,
    );
    const receiver = groups
      .map((group, index) => ({ group, index }))
      .filter(({ index }) => index !== groupIndex)
      .sort((left, right) => left.group.length - right.group.length)[0];
    if (receiver) receiver.group.push(person);
    else groups.push([person]);
  }
  renderGroups();
}

function renderGroups() {
  groupList.replaceChildren();
  reshuffleButton.hidden = groups.length === 0;
  copyButton.hidden = groups.length === 0;
  const total = groups.reduce((sum, group) => sum + group.length, 0);
  resultsMeta.textContent = `${groups.length} ${groups.length === 1 ? "group" : "groups"} · ${total} people`;

  groups.forEach((group, index) => {
    const card = document.createElement("article");
    card.className = "group-card";
    card.style.animationDelay = `${Math.min(index * 45, 270)}ms`;

    const top = document.createElement("div");
    top.className = "group-top";
    const label = document.createElement("span");
    label.className = "group-label";
    label.textContent = `Group ${index + 1}`;
    const size = document.createElement("span");
    size.className = "group-size";
    size.textContent = `${group.length} ${group.length === 1 ? "person" : "people"}`;
    top.append(label, size);

    const people = document.createElement("div");
    people.className = "person-list";
    group.forEach((name) => {
      const person = document.createElement("div");
      person.className = "person";
      person.textContent = name;
      people.append(person);
    });

    const actions = document.createElement("div");
    actions.className = "group-actions";
    const removeButton = document.createElement("button");
    removeButton.className = "icon-button";
    removeButton.type = "button";
    removeButton.textContent = "−";
    removeButton.title = `Move a person out of group ${index + 1}`;
    removeButton.setAttribute("aria-label", removeButton.title);
    removeButton.disabled = group.length < 2;
    removeButton.addEventListener("click", () => movePerson(index, "remove"));
    const addButton = document.createElement("button");
    addButton.className = "icon-button";
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.title = `Move a person into group ${index + 1}`;
    addButton.setAttribute("aria-label", addButton.title);
    addButton.disabled = !groups.some(
      (other, otherIndex) => otherIndex !== index && other.length > 1,
    );
    addButton.addEventListener("click", () => movePerson(index, "add"));
    actions.append(removeButton, addButton);

    card.append(top, people, actions);
    groupList.append(card);
  });
}

namesInput.addEventListener("input", updateCount);
document.querySelector("#make-groups").addEventListener("click", makeGroups);
document.querySelector("#sample-button").addEventListener("click", () => {
  namesInput.value =
    "Avery\nJordan\nSam\nRiley\nMorgan\nCasey\nTaylor\nQuinn\nJamie";
  updateCount();
  message.textContent = "";
  namesInput.focus();
});
reshuffleButton.addEventListener("click", makeGroups);
copyButton.addEventListener("click", async () => {
  const text = groups
    .map((group, index) => `Group ${index + 1}: ${group.join(", ")}`)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    message.textContent = "Groups copied to clipboard.";
  } catch {
    message.textContent = "Clipboard access is unavailable in this browser.";
  }
});

updateCount();
