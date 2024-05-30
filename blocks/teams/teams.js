import { readBlockConfig, fetchPlaceholders } from '../../scripts/aem.js';
import { getAuthorImage } from '../../scripts/utils.js';

const OWNER = 'owner';
const leadBoardHTML = (author, authorImg) => `<div class="lb-user-img"><img src="${authorImg}" alt="${author}" width="72" height="72"><strong>${author}</strong></div>`;
const teamMemberImgHTML = (author, authorImg) => `<div class="team-user-img"><img src="${authorImg}" alt="${author}" width="24" height="24">${author}</div>`;
const teamMemberHTML = (author) => `<div>${author}</div>`;

function generateTeamList(category, team, placeholder) {
  const users = team.split(',');
  const teamSize = users.length;
  const isOwner = category.startsWith(OWNER);

  const teamContainer = document.createElement('div');
  teamContainer.className = 'team-container';
  const teamHeading = document.createElement('h3');
  teamHeading.innerHTML = `${category.replace(/-/g, ' ')} (${teamSize})`;
  teamContainer.append(teamHeading);

  const teamList = (document.createElement('div'));
  teamList.className = 'team-list';

  users.forEach((user) => {
    const userImg = getAuthorImage(user.trim(), placeholder);
    if (isOwner && userImg) {
      teamList.insertAdjacentHTML('beforeend', teamMemberImgHTML(user, userImg));
    } else {
      teamList.insertAdjacentHTML('beforeend', teamMemberHTML(user));
    }
  });

  teamContainer.append(teamList);
  return teamContainer;
}

function generateLeadboardList(team, placeholder) {
  const users = team.split(',');
  const teamContainer = document.createElement('div');
  teamContainer.className = 'leadboard-container';

  users.forEach((user) => {
    const userImg = getAuthorImage(user.trim(), placeholder);
    if (userImg) {
      teamContainer.insertAdjacentHTML('beforeend', leadBoardHTML(user, userImg));
    }
  });

  return teamContainer;
}

export default async function decorate(block) {
  const HEADING = 'heading';
  const blockConfig = readBlockConfig(block);
  const placeholder = await fetchPlaceholders();
  const isLeaderboard = block.classList.contains('leaderboard');

  block.innerHTML = '';
  Object.entries(blockConfig).map((entry) => {
    const key = entry[0]; const value = entry[1];
    if (key === HEADING) {
      const heading = document.createElement('h2');
      heading.innerHTML = value;
      block.append(heading);
    } else if (isLeaderboard) {
      block.append(generateLeadboardList(value, placeholder));
    } else {
      block.append(generateTeamList(key, value, placeholder));
    }
    return block;
  });
}
