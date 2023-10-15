export 'prompts.dart';

class Prompt {
  final int id;
  final String uuid;
  final String identityA;
  final String identityB;
  final int count;
  final List<String> iceBreakers;

  @override
  String toString() {
    return 'id: $id\nuuid: $uuid\nidentityA: $identityA\nidentityB: $identityB\n';
  }

  Prompt({
    required this.id,
    required this.uuid,
    required this.identityA,
    required this.identityB,
    required this.count,
    required this.iceBreakers,
  });
}

final promptData = [
  {
    'id': 0,
    'uuid': "abc123",
    'identityA': "Vegan",
    'identityB': "Meat Eater",
    'count': 0,
    'iceBreakers': [
      "What's your favorite meal?",
      "How do you feel about tofu?",
      "Describe the last burger you ate.",
    ],
  },
  {
    'id': 1,
    'uuid': "xyz789",
    'identityA': "Christian",
    'identityB': "Atheist",
    'count': 0,
    'iceBreakers': [
      "How do you celebrate Christmas?",
      "What's your view on the afterlife?",
      "How often do you visit places of worship?",
    ],
  },
  {
    'id': 2,
    'uuid': "jkl456",
    'identityA': "Rapper",
    'identityB': "Fake Rapper",
    'count': 0,
    'iceBreakers': [
      "Who's your favorite hip-hop artist?",
      "Have you ever performed on stage?",
      "What's your go-to rap song to sing along to?",
    ],
  },
  {
    'id': 3,
    'uuid': "def123",
    'identityA': "Left-wing",
    'identityB': "Right-wing",
    'count': 0,
    'iceBreakers': [
      "Who's your favorite political leader?",
      "What's your stance on healthcare?",
      "How do you feel about tax breaks?",
    ],
  },
  {
    'id': 4,
    'uuid': "ghi789",
    'identityA': "iPhone User",
    'identityB': "Android User",
    'count': 0,
    'iceBreakers': [
      "Which app store do you prefer?",
      "Have you ever switched from one to the other?",
      "What feature of your phone do you value the most?",
    ],
  },
  {
    'id': 5,
    'uuid': "mno456",
    'identityA': "Climate Change Believer",
    'identityB': "Climate Change Skeptic",
    'count': 0,
    'iceBreakers': [
      "What's your primary news source?",
      "Have you ever been impacted by extreme weather?",
      "How do you feel about renewable energy?",
    ],
  },
  {
    'id': 6,
    'uuid': "pqr123",
    'identityA': "Mac User",
    'identityB': "PC User",
    'count': 0,
    'iceBreakers': [
      "Which operating system do you find more user-friendly?",
      "How often do you upgrade your computer?",
      "What's your go-to software or application on your platform?",
    ],
  },
  {
    'id': 7,
    'uuid': "stu456",
    'identityA': "Pro-gun control",
    'identityB': "Anti-gun control",
    'count': 0,
    'iceBreakers': [
      "How do you feel about stricter background checks for gun purchases?",
      "Have you ever taken a firearm safety course?",
      "What's your perspective on concealed carry permits?",
    ],
  },
  {
    'id': 8,
    'uuid': "vwx789",
    'identityA': "Pro-choice",
    'identityB': "Pro-life",
    'count': 0,
    'iceBreakers': [
      "How do you feel about reproductive health education in schools?",
      "Do you think the government should have a say in personal health decisions?",
      "What are your thoughts on pregnancy prevention methods?",
    ],
  },
  {
    'id': 9,
    'uuid': "yza012",
    'identityA': "Pro-vaccination",
    'identityB': "Anti-vaccination",
    'count': 0,
    'iceBreakers': [
      "How do you stay informed about new vaccines or medical updates?",
      "What's your stance on mandatory vaccinations for school admissions?",
      "Have you or your family experienced any side effects from vaccines?",
    ],
  },
  {
    'id': 10,
    'uuid': "bcd345",
    'identityA': "Public School",
    'identityB': "Homeschooling",
    'count': 0,
    'iceBreakers': [
      "How do you feel about standardized testing?",
      "What do you think are the most important aspects of education?",
      "How do you envision the future of learning?",
    ],
  },
  {
    'id': 11,
    'uuid': "efg678",
    'identityA': "Cat Person",
    'identityB': "Dog Person",
    'count': 0,
    'iceBreakers': [
      "Which pet do you think requires more attention and why?",
      "Have you had any memorable experiences with a cat or dog?",
      "How do you feel about training or disciplining pets?",
    ],
  },
  {
    'id': 12,
    'uuid': "hij901",
    'identityA': "Morning Person",
    'identityB': "Night Owl",
    'count': 0,
    'iceBreakers': [
      "What's the first thing you do after waking up?",
      "Do you rely on an alarm to wake up or naturally rise?",
      "What time of day do you feel most productive or creative?",
    ],
  },
];
// At the end of the prompts.dart file

final List<Prompt> prompts = promptData.map((prompt) {
  return Prompt(
    id: prompt['id'] as int,
    uuid: prompt['uuid'] as String,
    identityA: prompt['identityA'] as String,
    identityB: prompt['identityB'] as String,
    count: prompt['count'] as int,
    iceBreakers: List<String>.from(prompt['iceBreakers'] as List<dynamic>),
  );
}).toList();
