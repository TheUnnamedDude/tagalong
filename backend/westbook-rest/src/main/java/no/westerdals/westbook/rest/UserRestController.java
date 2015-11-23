package no.westerdals.westbook.rest;

import no.westerdals.westbook.model.User;
import no.westerdals.westbook.mongodb.StudyFieldRepository;
import no.westerdals.westbook.mongodb.UserRepository;
import no.westerdals.westbook.responses.UserResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class UserRestController
{
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudyFieldRepository studyFieldRepository;

    @RequestMapping(value="/rest/v1/users/{userId}", method=RequestMethod.GET)
    public UserResponse getById(@PathVariable String userId)
    {
        return resolve(userRepository.findOne(userId));
    }

    @RequestMapping(value= "/rest/v1/users/by-name/{nameString}", method=RequestMethod.GET)
    public List<UserResponse> getByName(@PathVariable String nameString, @RequestParam(defaultValue = "20") int maxResults)
    {
        String[] nameParts = nameString.split(" ");
        if (nameParts.length > 4)
            return null;

        ArrayList<UserResponse> found = new ArrayList<>();

        findUsersByFullName(found, nameString, maxResults);

        if (found.size() < maxResults)
        {
            findUsersBySurname(found, nameString, maxResults);
        }
        return found;
    }

    @RequestMapping(value="/rest/v1/users", method=RequestMethod.PATCH)
    public UserResponse updateUserInfo(@RequestBody User user)
    {
        // This needs some checks if its sane
        if (user.getId() == null)
            return null;
        userRepository.updateStudyField(user.getId(), user.getStudyFieldId());
        return resolve(userRepository.findOne(user.getId()));
    }

    @RequestMapping(value="/rest/v1/users/by-studyfield/{studyField}", method=RequestMethod.GET)
    public List<UserResponse> getByStudyField(@PathVariable String studyField)
    {
        return userRepository.getByStudyFieldId(resolveStudyField(studyField)).stream()
                .map(this::resolve)
                .collect(Collectors.toList());
    }

    @RequestMapping(value="/rest/v1/users/by-email/{emailAddress}", method=RequestMethod.GET)
    public UserResponse getByEmailAddress(@PathVariable String emailAddress)
    {
        return resolve(userRepository.getByEmail(emailAddress.replaceAll("_", ".")));
    }

    //!!!!!!!!!!NEED TO CHECK ACCESS LEVEL!!!!!!!!!!!!
    @RequestMapping(value="/rest/v1/users/{userId}", method=RequestMethod.DELETE)
    public String deleteUser(@PathVariable String userId)
    {
        if (userRepository.findOne(userId) == null)
        {
            return "COULD NOT FIND USER\n";
        }
        userRepository.delete(userId);
        return "OK\n";
    }

    @RequestMapping(value="/rest/v1/users", method=RequestMethod.POST)
    public String createUser(@RequestBody User user)
    {
        user.setId(null);
        userRepository.save(user);
        User inserted = userRepository.save(user);
        return inserted.getId() + "-OK\n";
    }

    @RequestMapping(value="/rest/v1/users", method=RequestMethod.GET)
    public List<UserResponse> getAllUsers()
    {
        return userRepository
                .findAll()
                .stream()
                .map(this::resolve)
                .collect(Collectors.toList());
    }

    private void findUsersByFullName(List<UserResponse> found, String fullname, int maxResults)
    {
        String[] nameParts = fullname.split(" ");
        for (int i = 1; i < nameParts.length; i++)
        {
            String possibleName = join(nameParts, 0, i);
            String possibleSurname = join(nameParts, i, nameParts.length);
            User user = userRepository.getByFullName(possibleName, possibleSurname);
            if (user != null)
            {
                found.add(resolve(user));
            }
            if (found.size() >= maxResults)
                return;
        }
    }

    private void findUsersBySurname(List<UserResponse> found, String surname, int maxResults)
    {
        userRepository.getBySurname(surname, new PageRequest(0, maxResults - found.size()))
                .stream()
                .filter(user -> !found.contains(user))
                .map(this::resolve)
                .forEach(found::add);
    }

    public UserResponse resolve(User user)
    {
        if (user == null || user.getId() == null)
            return null;
        UserResponse userResponse = new UserResponse(user);
        userResponse.setStudyFieldDisplayName(null); // TODO
        userResponse.setProfilePicture(null); //TODO
        return userResponse;
    }

    private String resolveStudyField(String studyField)
    {
        return studyFieldRepository.getByName(studyField).getId();
    }

    private String join(String[] strs, int startIndex, int endIndex)
    {
        StringBuilder result = new StringBuilder();
        for (int i = startIndex; i < endIndex; i++)
        {
            result.append(strs[i]);
        }
        return result.toString();
    }
}